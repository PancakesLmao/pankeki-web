import { Elysia } from "elysia";

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
    () => ({
      data: [
        { value: "gacha", label: "Gacha" },
        { value: "sci-fi", label: "Sci-Fi" },
        { value: "fantasy", label: "Fantasy" },
        { value: "hack-and-slash", label: "Hack and Slash" },
        { value: "action-rpg", label: "Action RPG" },
        { value: "rpg", label: "RPG" },
        { value: "jrpg", label: "JRPG" },
        { value: "visual-novel", label: "Visual Novel" },
        { value: "turn-based", label: "Turn-based" },
        { value: "open-world", label: "Open World" },
      ],
    }),
    {
      detail: {
        tags: ["Enums"],
        description: "Get all available game genres",
      },
    }
  )
  .get(
    "/game-platforms",
    () => ({
      data: [
        { value: "pc", label: "PC" },
        { value: "mobile", label: "Mobile" },
        { value: "playstation", label: "PlayStation" },
      ],
    }),
    {
      detail: {
        tags: ["Enums"],
        description: "Get all available game platforms",
      },
    }
  );
