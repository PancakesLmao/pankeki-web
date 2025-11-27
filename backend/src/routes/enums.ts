import { Elysia } from "elysia";
import { getGameGenres, getGamePlatforms } from "../libs/db";

export const enumRoutes = new Elysia({ prefix: "/api/enums" })
  .get(
    "/project-statuses",
    () => ({
      data: [
        { value: "Completed and Published", label: "Completed & Published" },
        { value: "Ongoing", label: "Ongoing" },
        { value: "Deprecated", label: "Deprecated" },
        {
          value: "Completed and Documenting",
          label: "Completed & Documenting",
        },
        { value: "Upcoming", label: "Upcoming" },
        { value: "Under Maintenance", label: "Under Maintenance" },
      ],
    }),
    {
      detail: {
        tags: ["Enums"],
        description: "Get all available project statuses",
      },
    }
  )
  .get(
    "/game-genres",
    async () => {
      const genres = await getGameGenres();
      const data = Object.entries(genres).map(
        ([apiValue, { displayValue }]) => ({
          value: apiValue,
          label: displayValue,
        })
      );
      return { data };
    },
    {
      detail: {
        tags: ["Enums"],
        description: "Get all available game genres",
      },
    }
  )
  .get(
    "/game-platforms",
    async () => {
      const platforms = await getGamePlatforms();
      const data = Object.entries(platforms).map(
        ([apiValue, { displayValue }]) => ({
          value: apiValue,
          label: displayValue,
        })
      );
      return { data };
    },
    {
      detail: {
        tags: ["Enums"],
        description: "Get all available game platforms",
      },
    }
  );
