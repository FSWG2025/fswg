import { type Request, type Response } from "express";
import Service from '../../models/Service';
import { logAudit } from '../../utils/logAudit';
import { DEFAULT_SERVICES } from './defaultServices';

let seedingDefaults: Promise<void> | null = null;

/** If the catalog is empty, insert the canonical FSWG offerings once. */
async function ensureDefaultServices() {
  const count = await Service.countDocuments();
  if (count > 0) return;

  if (!seedingDefaults) {
    seedingDefaults = (async () => {
      try {
        const stillEmpty = (await Service.countDocuments()) === 0;
        if (!stillEmpty) return;
        await Service.insertMany(
          DEFAULT_SERVICES.map((s) => ({ ...s, isActive: true, icon: "" })),
          { ordered: false }
        );
        console.log(
          `[services] Seeded ${DEFAULT_SERVICES.length} default public services`
        );
      } catch (err) {
        console.warn("[services] Default seed skipped:", (err as Error).message);
      } finally {
        seedingDefaults = null;
      }
    })();
  }

  await seedingDefaults;
}

// @desc    Create a new Service
// @route   POST /api/services
// @access  Private/Admin
export const createService = async (req: Request, res: Response) => {
  try {
    const { title, description, category, icon, isActive, order } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ message: "Title, description, and category are required" });
    }

    const allowedCategories = ["financial_education", "insurance", "real_estate", "wealth_building", "entrepreneurship"];
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({ message: `Invalid category. Must be one of: ${allowedCategories.join(", ")}` });
    }

    const service = await Service.create({
      title,
      description,
      category,
      icon: icon || "",
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
    });

    await logAudit({
      userId: (req as any).user._id.toString(),
      action: "Created Service",
      details: `Service "${title}" (${category})`,
      req,
    });

    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Get all Services (public)
// @route   GET /api/services
// @access  Public
export const getAllServices = async (req: Request, res: Response) => {
  try {
    await ensureDefaultServices();

    const { category, active } = req.query;
    const filter: any = {};

    if (category) filter.category = category;
    if (active === "true") filter.isActive = true;
    else if (active === "false") filter.isActive = false;

    const user = (req as any).user;
    if (!user || !["admin", "ops_manager"].includes(user.role)) {
      filter.isActive = true;
    }

    const services = await Service.find(filter).sort({ order: 1, title: 1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Get service by ID
// @route   GET /api/services/:id
// @access  Public
export const getServiceById = async (req: Request, res: Response) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Update a Service
// @route   PATCH /api/services/:id
// @access  Private/Admin
export const updateService = async (req: Request, res: Response) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (req.body.title) service.title = req.body.title;
    if (req.body.description) service.description = req.body.description;
    if (req.body.icon !== undefined) service.icon = req.body.icon;
    if (req.body.isActive !== undefined) service.isActive = req.body.isActive;
    if (req.body.order !== undefined) service.order = req.body.order;

    if (req.body.category) {
      const allowedCategories = ["financial_education", "insurance", "real_estate", "wealth_building", "entrepreneurship"];
      if (!allowedCategories.includes(req.body.category)) {
        return res.status(400).json({ message: `Invalid category. Must be one of: ${allowedCategories.join(", ")}` });
      }
      service.category = req.body.category;
    }

    const updated = await service.save();

    await logAudit({
      userId: (req as any).user._id.toString(),
      action: "Updated Service",
      details: `Service "${updated.title}" updated`,
      req,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Delete a Service
// @route   DELETE /api/services/:id
// @access  Private/Admin
export const deleteService = async (req: Request, res: Response) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    await logAudit({
      userId: (req as any).user._id.toString(),
      action: "Deleted Service",
      details: `Service "${service.title}" deleted`,
      req,
    });

    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Get services by category
// @route   GET /api/services/category/:category
// @access  Public
export const getServicesByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const services = await Service.find({ category, isActive: true }).sort({ order: 1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};