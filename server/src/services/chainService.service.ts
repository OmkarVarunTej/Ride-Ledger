import type { SupabaseClient } from "@supabase/supabase-js";
import { MaintenanceRepository } from "../repositories/maintenance.repository.js";
import { FillupsRepository } from "../repositories/fillups.repository.js";
import { SettingsRepository } from "../repositories/settings.repository.js";
import type { MaintenanceEntryRow } from "../types/domain.js";

export type CheckpointStatus = "completed" | "pending" | "locked";

export interface ChainCheckpoint {
  index: number;
  thresholdKm: number;
  status: CheckpointStatus;
  completedEntry: MaintenanceEntryRow | null;
}

export interface ChainServiceTracker {
  intervalKm: number;
  currentOdometer: number;
  checkpoints: ChainCheckpoint[];
  nextServiceInKm: number;
  progressPercent: number;
  lastService: MaintenanceEntryRow | null;
  lastCost: number | null;
  averageCost: number | null;
  averageIntervalKm: number | null;
}

const CHAIN_CATEGORIES = ["Chain Cleaning", "Chain Lubing"];

export class ChainServiceTrackerService {
  private readonly maintenance: MaintenanceRepository;
  private readonly fillups: FillupsRepository;
  private readonly settings: SettingsRepository;

  constructor(db: SupabaseClient, userId: string) {
    this.maintenance = new MaintenanceRepository(db, userId);
    this.fillups = new FillupsRepository(db, userId);
    this.settings = new SettingsRepository(db, userId);
  }

  async tracker(): Promise<ChainServiceTracker> {
    const [allMaintenance, allFillups, settings] = await Promise.all([
      this.maintenance.listAll(),
      this.fillups.listAll(),
      this.settings.get(),
    ]);

    const intervalKm = Number(settings.chain_service_interval_km) || 500;

    const chainEntries = allMaintenance
      .filter((m) => CHAIN_CATEGORIES.includes(m.category))
      .sort((a, b) => Number(a.odometer) - Number(b.odometer));

    const currentOdometer = Math.max(
      0,
      ...allFillups.map((f) => Number(f.odometer)),
      ...allMaintenance.map((m) => Number(m.odometer))
    );

    const numCheckpoints = Math.floor(currentOdometer / intervalKm) + 1;
    const checkpoints: ChainCheckpoint[] = [];
    let firstIncompleteFound = false;
    let firstPendingIndex: number | null = null;

    for (let i = 1; i <= numCheckpoints; i++) {
      const lowerBound = (i - 1) * intervalKm;
      const upperBound = i * intervalKm;
      const matchingEntry =
        chainEntries.find((e) => Number(e.odometer) > lowerBound && Number(e.odometer) <= upperBound) ?? null;

      let status: CheckpointStatus;
      if (matchingEntry) {
        status = "completed";
      } else if (!firstIncompleteFound) {
        status = "pending";
        firstIncompleteFound = true;
        firstPendingIndex = i;
      } else {
        status = "locked";
      }

      checkpoints.push({ index: i, thresholdKm: upperBound, status, completedEntry: matchingEntry });
    }

    const pendingThreshold = firstPendingIndex ? firstPendingIndex * intervalKm : numCheckpoints * intervalKm;
    const bandStart = pendingThreshold - intervalKm;
    const nextServiceInKm = Math.max(0, pendingThreshold - currentOdometer);
    const progressPercent = Math.min(100, Math.max(0, ((currentOdometer - bandStart) / intervalKm) * 100));

    const lastService = chainEntries.length > 0 ? chainEntries[chainEntries.length - 1] : null;
    const lastCost = lastService ? Number(lastService.cost) : null;
    const averageCost =
      chainEntries.length > 0
        ? chainEntries.reduce((sum, e) => sum + Number(e.cost), 0) / chainEntries.length
        : null;

    let averageIntervalKm: number | null = null;
    if (chainEntries.length > 1) {
      const gaps: number[] = [];
      for (let i = 1; i < chainEntries.length; i++) {
        gaps.push(Number(chainEntries[i].odometer) - Number(chainEntries[i - 1].odometer));
      }
      averageIntervalKm = gaps.reduce((sum, g) => sum + g, 0) / gaps.length;
    }

    return {
      intervalKm,
      currentOdometer,
      checkpoints,
      nextServiceInKm,
      progressPercent,
      lastService,
      lastCost,
      averageCost,
      averageIntervalKm,
    };
  }
}
