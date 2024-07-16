import { DataArray, STask } from "obsidian-dataview";
import { derived, Readable } from "svelte/store";

import { DayPlannerSettings } from "../../settings";

interface UseDataviewTasksProps {
  listsFromVisibleDailyNotes: Readable<DataArray<STask>>;
  tasksFromExtraSources: Readable<DataArray<STask>>;
  settingsStore: Readable<DayPlannerSettings>;
}

export function useDataviewTasks({
  listsFromVisibleDailyNotes,
  tasksFromExtraSources,
  settingsStore,
}: UseDataviewTasksProps) {
  return derived(
    [listsFromVisibleDailyNotes, tasksFromExtraSources, settingsStore],
    ([$listsFromVisibleDailyNotes, $tasksFromExtraSources, $settingsStore]) => {
      const allTasks = [
        ...$listsFromVisibleDailyNotes,
        ...$tasksFromExtraSources,
      ];

      const cancelledStatuses = "->";
      return $settingsStore.showCompletedTasks
        ? allTasks
        : allTasks.filter(
            (sTask: STask) =>
              !sTask.completed && !cancelledStatuses.includes(sTask.status),
          );
    },
  );
}
