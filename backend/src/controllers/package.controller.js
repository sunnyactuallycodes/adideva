import { Package } from "../models/package.model.js";
import { isDbConnected } from "../config/db.js";
import { inMemoryStore } from "../utils/inMemoryStore.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getCache,
  setCache,
  deleteCachePattern,
} from "../config/redis.js";

const CACHE_TTL = Number(process.env.REDIS_CACHE_TTL) || 3600;

/**
 * @desc    Get all packages (Public with category & search filter + Redis Caching)
 * @route   GET /api/v1/packages
 * @access  Public
 */
export const getAllPackages = asyncHandler(async (req, res) => {
  const { category, search, activeOnly = "false" } = req.query;
  const cacheKey = `packages:list:${category || "all"}:${search || "all"}:${activeOnly}`;

  // Check Redis Cache first
  const cachedData = await getCache(cacheKey);
  if (cachedData) {
    return res.status(200).json(
      new ApiResponse(
        200,
        { packages: cachedData, fromCache: true },
        "Packages retrieved from cache"
      )
    );
  }

  let packagesList = [];

  if (isDbConnected) {
    try {
      const query = {};
      if (activeOnly === "true") query.active = true;
      if (category && category !== "All") query.category = category;
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { places: { $regex: search, $options: "i" } },
        ];
      }
      packagesList = await Package.find(query).sort({ createdAt: -1 });
    } catch (e) {
      console.warn("DB query fallback to in-memory store:", e.message);
    }
  }

  // Fallback to in-memory store if DB query returned 0 or DB not connected
  if (!packagesList || packagesList.length === 0) {
    packagesList = inMemoryStore.packages.filter((pkg) => {
      if (activeOnly === "true" && !pkg.active) return false;
      if (category && category !== "All" && pkg.category !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        const mTitle = pkg.title?.toLowerCase().includes(q);
        const mPlaces = pkg.places?.toLowerCase().includes(q);
        if (!mTitle && !mPlaces) return false;
      }
      return true;
    });
  }

  // Store in Redis Cache
  await setCache(cacheKey, packagesList, CACHE_TTL);

  return res.status(200).json(
    new ApiResponse(
      200,
      { packages: packagesList, fromCache: false },
      "Packages retrieved successfully"
    )
  );
});

/**
 * @desc    Get single package by ID (numeric id or Mongo _id) with Redis Caching
 * @route   GET /api/v1/packages/:id
 * @access  Public
 */
export const getPackageById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const cacheKey = `package:${id}`;

  const cachedPackage = await getCache(cacheKey);
  if (cachedPackage) {
    return res.status(200).json(
      new ApiResponse(
        200,
        { package: cachedPackage, fromCache: true },
        "Package retrieved from cache"
      )
    );
  }

  let pkg = null;

  if (isDbConnected) {
    try {
      if (!isNaN(Number(id))) {
        pkg = await Package.findOne({ id: Number(id) });
      }
      if (!pkg && String(id).match(/^[0-9a-fA-F]{24}$/)) {
        pkg = await Package.findById(id);
      }
    } catch (e) {
      console.warn("Package getById DB fallback:", e.message);
    }
  }

  if (!pkg) {
    pkg =
      inMemoryStore.packages.find(
        (p) => p.id === Number(id) || String(p.id) === String(id) || p?._id === id
      ) || inMemoryStore.packages[0];
  }

  if (!pkg) {
    throw new ApiError(404, "Travel package not found.");
  }

  await setCache(cacheKey, pkg, CACHE_TTL);

  return res.status(200).json(
    new ApiResponse(200, { package: pkg, fromCache: false }, "Package retrieved successfully")
  );
});

/**
 * @desc    Create new package (Admin)
 * @route   POST /api/v1/packages
 * @access  Private/Admin
 */
export const createPackage = asyncHandler(async (req, res) => {
  const packageData = req.body;
  const newId = packageData.id || Date.now();

  const newPkg = {
    ...packageData,
    id: newId,
    active: packageData.active !== undefined ? packageData.active : true,
    price: Number(packageData.price) || 19999,
    originalPrice: Number(packageData.originalPrice) || Math.round(Number(packageData.price || 19999) * 1.25),
    highlights: Array.isArray(packageData.highlights) ? packageData.highlights : [],
  };

  inMemoryStore.packages.unshift(newPkg);

  if (isDbConnected) {
    try {
      await Package.create(newPkg);
    } catch (e) {
      console.warn("Package creation DB fallback:", e.message);
    }
  }

  await deleteCachePattern("packages:*");

  return res.status(201).json(
    new ApiResponse(201, { package: newPkg }, "Package created successfully")
  );
});

/**
 * @desc    Update package details (Admin)
 * @route   PUT /api/v1/packages/:id
 * @access  Private/Admin
 */
export const updatePackage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const idx = inMemoryStore.packages.findIndex(
    (p) => p.id === Number(id) || String(p.id) === String(id)
  );
  if (idx !== -1) {
    inMemoryStore.packages[idx] = { ...inMemoryStore.packages[idx], ...updateData };
  }

  let updatedPkg = inMemoryStore.packages[idx] || updateData;

  if (isDbConnected) {
    try {
      if (!isNaN(Number(id))) {
        updatedPkg = await Package.findOneAndUpdate({ id: Number(id) }, updateData, { new: true });
      }
      if (!updatedPkg && String(id).match(/^[0-9a-fA-F]{24}$/)) {
        updatedPkg = await Package.findByIdAndUpdate(id, updateData, { new: true });
      }
    } catch (e) {
      console.warn("Package update DB fallback:", e.message);
    }
  }

  await deleteCachePattern("packages:*");
  await deleteCachePattern(`package:${id}`);

  return res.status(200).json(
    new ApiResponse(200, { package: updatedPkg }, "Package updated successfully")
  );
});

/**
 * @desc    Toggle package active/inactive visibility (Admin)
 * @route   PATCH /api/v1/packages/:id/toggle-active
 * @access  Private/Admin
 */
export const togglePackageActive = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const idx = inMemoryStore.packages.findIndex(
    (p) => p.id === Number(id) || String(p.id) === String(id)
  );
  if (idx !== -1) {
    inMemoryStore.packages[idx].active = !inMemoryStore.packages[idx].active;
  }

  let pkg = inMemoryStore.packages[idx];

  if (isDbConnected) {
    try {
      if (!isNaN(Number(id))) {
        pkg = await Package.findOne({ id: Number(id) });
      }
      if (!pkg && String(id).match(/^[0-9a-fA-F]{24}$/)) {
        pkg = await Package.findById(id);
      }
      if (pkg) {
        pkg.active = !pkg.active;
        await pkg.save();
      }
    } catch (e) {
      console.warn("Toggle active DB fallback:", e.message);
    }
  }

  await deleteCachePattern("packages:*");
  await deleteCachePattern(`package:${id}`);

  return res.status(200).json(
    new ApiResponse(200, { package: pkg }, "Package active status toggled")
  );
});

/**
 * @desc    Delete package (Admin)
 * @route   DELETE /api/v1/packages/:id
 * @access  Private/Admin
 */
export const deletePackage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  inMemoryStore.packages = inMemoryStore.packages.filter(
    (p) => p.id !== Number(id) && String(p.id) !== String(id)
  );

  if (isDbConnected) {
    try {
      if (!isNaN(Number(id))) {
        await Package.findOneAndDelete({ id: Number(id) });
      }
      if (String(id).match(/^[0-9a-fA-F]{24}$/)) {
        await Package.findByIdAndDelete(id);
      }
    } catch (e) {
      console.warn("Delete package DB fallback:", e.message);
    }
  }

  await deleteCachePattern("packages:*");
  await deleteCachePattern(`package:${id}`);

  return res.status(200).json(
    new ApiResponse(200, null, "Package deleted successfully")
  );
});
