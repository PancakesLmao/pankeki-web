import { Elysia, t } from "elysia";
import { cookie } from "@elysiajs/cookie";
import { prisma } from "../libs/prisma";
import { requireAuth } from "../middleware/auth";

// Helper function to serialize BigInt to string
const serializeGame = (game: any) => ({
  ...game,
  id: game.id.toString(),
});

// Mapping for genre enum (URL-friendly <-> Database enum)
const genreMap: Record<string, string> = {
  gacha: "Gacha",
  "sci-fi": "Sci_Fi",
  fantasy: "Fantasy",
  "hack-and-slash": "Hack_And_Slash",
  "action-rpg": "Action_RPG",
  rpg: "RPG",
  jrpg: "JRPG",
  "visual-novel": "Visual_Novel",
  "turn-based": "Turn_based",
  "open-world": "Open_World",
};

// Mapping for platform enum (URL-friendly <-> Database enum)
const platformMap: Record<string, string> = {
  pc: "PC",
  mobile: "Mobile",
  playstation: "PlayStation",
};

export const gameRoutes = new Elysia({ prefix: "/games" })
  .use(cookie())
  // Get all games (public access)
  .get(
    "/",
    async ({ query, set }) => {
      try {
        // Build filter object
        const where: any = {};

        // Filter by genre if provided (convert URL-friendly to DB enum)
        if (query.genre) {
          const dbGenre = genreMap[query.genre] || query.genre;
          where.genre = {
            has: dbGenre,
          };
        }

        // Filter by platform if provided (convert URL-friendly to DB enum)
        if (query.platform) {
          const dbPlatform = platformMap[query.platform] || query.platform;
          where.platform = {
            has: dbPlatform,
          };
        }

        const games = await prisma.games.findMany({
          where: Object.keys(where).length > 0 ? where : undefined,
          orderBy: { created_at: "desc" },
        });

        return { games: games.map(serializeGame) };
      } catch (error: any) {
        set.status = 500;
        return { error: error.message };
      }
    },
    {
      query: t.Object({
        genre: t.Optional(
          t.Union(
            [
              t.Literal("gacha"),
              t.Literal("sci-fi"),
              t.Literal("fantasy"),
              t.Literal("hack-and-slash"),
              t.Literal("action-rpg"),
              t.Literal("rpg"),
              t.Literal("jrpg"),
              t.Literal("visual-novel"),
              t.Literal("turn-based"),
              t.Literal("open-world"),
            ],
            {
              description: "Filter games by genre. Use lowercase with hyphens.",
              default: "rpg",
            }
          )
        ),
        platform: t.Optional(
          t.Union(
            [t.Literal("pc"), t.Literal("mobile"), t.Literal("playstation")],
            {
              description: "Filter games by platform. Use lowercase.",
              default: "pc",
            }
          )
        ),
      }),
      detail: {
        tags: ["Games"],
        summary: "Get all games",
        description:
          "Retrieve all games (public access). Can be filtered by genre or platform using URL-friendly format (e.g., 'rpg', 'action-rpg', 'pc').",
      },
    }
  )

  // Get a single game by ID (public access)
  .get(
    "/:id",
    async ({ params, set }) => {
      try {
        const game = await prisma.games.findUnique({
          where: { id: BigInt(params.id) },
        });

        if (!game) {
          set.status = 404;
          return { error: "Game not found" };
        }

        return { game: serializeGame(game) };
      } catch (error: any) {
        set.status = 500;
        return { error: error.message };
      }
    },
    {
      params: t.Object({
        id: t.Numeric({
          description: "Game ID",
          default: 1,
        }),
      }),
      detail: {
        tags: ["Games"],
        summary: "Get game by ID",
        description: "Retrieve a single game by its ID (public access).",
      },
    }
  )

  // Create a new game (admin only)
  .post(
    "/",
    async ({ body, cookie, set }) => {
      try {
        const { user } = await requireAuth({ cookie, set });

        // Convert URL-friendly enums to database enums
        const dbGenres = body.genre.map((g) => genreMap[g] || g);
        const dbPlatforms = body.platform.map((p) => platformMap[p] || p);

        const game = await prisma.games.create({
          data: {
            title: body.title,
            description: body.description,
            cover_img: body.cover_img,
            icon_img: body.icon_img,
            platform: dbPlatforms as any,
            genre: dbGenres as any,
            tags: body.tags,
            link: body.link,
            created_by: user!.id,
          },
        });

        return {
          message: "Game created successfully",
          game: serializeGame(game),
        };
      } catch (error: any) {
        set.status = 500;
        return { error: error.message };
      }
    },
    {
      body: t.Object({
        title: t.String({
          description: "Game title (required)",
          default: "Honkai: Star Rail",
        }),
        description: t.Optional(
          t.String({
            description: "Game description",
            default: "A space fantasy RPG with strategic turn-based combat",
          })
        ),
        cover_img: t.Optional(
          t.String({
            description: "Cover image URL",
            default: "https://placehold.co/1920x1080/png",
          })
        ),
        icon_img: t.Optional(
          t.String({
            description: "Icon image URL",
            default: "https://placehold.co/256x256/png",
          })
        ),
        platform: t.Array(
          t.Union([
            t.Literal("pc"),
            t.Literal("mobile"),
            t.Literal("playstation"),
          ]),
          {
            description: "Array of gaming platforms. Use lowercase.",
            default: ["pc"],
          }
        ),
        genre: t.Array(
          t.Union([
            t.Literal("gacha"),
            t.Literal("sci-fi"),
            t.Literal("fantasy"),
            t.Literal("hack-and-slash"),
            t.Literal("action-rpg"),
            t.Literal("rpg"),
            t.Literal("jrpg"),
            t.Literal("visual-novel"),
            t.Literal("turn-based"),
            t.Literal("open-world"),
          ]),
          {
            description: "Array of game genres. Use lowercase with hyphens.",
            default: ["rpg", "turn-based", "gacha"],
          }
        ),
        tags: t.Array(t.String(), {
          description: "Array of game tags",
          default: ["Story-Rich", "Anime", "Free to Play"],
        }),
        link: t.Optional(
          t.String({
            description: "Game link or store URL",
            default: "https://hsr.hoyoverse.com/",
          })
        ),
      }),
      detail: {
        tags: ["Games"],
        summary: "Create game",
        description:
          "Create a new game entry (admin only). The created_by field is automatically set from the authenticated user. Use URL-friendly format for genres and platforms (e.g., 'rpg', 'action-rpg', 'pc').",
      },
    }
  )

  // Update a game (admin only)
  .put(
    "/:id",
    async ({ params, body, cookie, set }) => {
      try {
        await requireAuth({ cookie, set });

        const updateData: any = {};
        if (body.title !== undefined) updateData.title = body.title;
        if (body.description !== undefined)
          updateData.description = body.description;
        if (body.cover_img !== undefined) updateData.cover_img = body.cover_img;
        if (body.icon_img !== undefined) updateData.icon_img = body.icon_img;
        if (body.platform !== undefined) {
          // Convert URL-friendly platforms to database enum
          updateData.platform = body.platform.map((p) => platformMap[p] || p);
        }
        if (body.genre !== undefined) {
          // Convert URL-friendly genres to database enum
          updateData.genre = body.genre.map((g) => genreMap[g] || g);
        }
        if (body.tags !== undefined) updateData.tags = body.tags;
        if (body.link !== undefined) updateData.link = body.link;

        const game = await prisma.games.update({
          where: { id: BigInt(params.id) },
          data: updateData,
        });

        return {
          message: "Game updated successfully",
          game: serializeGame(game),
        };
      } catch (error: any) {
        set.status = 500;
        return { error: error.message };
      }
    },
    {
      params: t.Object({
        id: t.Numeric({
          description: "Game ID to update",
          default: 1,
        }),
      }),
      body: t.Partial(
        t.Object({
          title: t.String({
            description: "Game title",
            default: "Honkai: Star Rail - Updated",
          }),
          description: t.String({
            description: "Game description",
            default: "Enhanced space fantasy RPG experience",
          }),
          cover_img: t.String({
            description: "Cover image URL",
            default: "https://placehold.co/1920x1080/png",
          }),
          icon_img: t.String({
            description: "Icon image URL",
            default: "https://placehold.co/256x256/png",
          }),
          platform: t.Array(
            t.Union([
              t.Literal("pc"),
              t.Literal("mobile"),
              t.Literal("playstation"),
            ]),
            {
              description: "Array of gaming platforms. Use lowercase.",
              default: ["pc"],
            }
          ),
          genre: t.Array(
            t.Union([
              t.Literal("gacha"),
              t.Literal("sci-fi"),
              t.Literal("fantasy"),
              t.Literal("hack-and-slash"),
              t.Literal("action-rpg"),
              t.Literal("rpg"),
              t.Literal("jrpg"),
              t.Literal("visual-novel"),
              t.Literal("turn-based"),
              t.Literal("open-world"),
            ]),
            {
              description: "Array of game genres. Use lowercase with hyphens.",
              default: ["rpg", "turn-based", "gacha", "sci-fi"],
            }
          ),
          tags: t.Array(t.String(), {
            description: "Array of game tags",
            default: ["Story-Rich", "Anime", "Free to Play", "Multiplayer"],
          }),
          link: t.String({
            description: "Game link or store URL",
            default: "https://hsr.hoyoverse.com/",
          }),
        })
      ),
      detail: {
        tags: ["Games"],
        summary: "Update game",
        description:
          "Update an existing game entry (admin only). All fields are optional. Use URL-friendly format for genres and platforms (e.g., 'rpg', 'action-rpg', 'pc').",
      },
    }
  )

  // Delete a game (admin only)
  .delete(
    "/:id",
    async ({ params, cookie, set }) => {
      try {
        await requireAuth({ cookie, set });

        await prisma.games.delete({
          where: { id: BigInt(params.id) },
        });

        return { message: "Game deleted successfully" };
      } catch (error: any) {
        set.status = 500;
        return { error: error.message };
      }
    },
    {
      params: t.Object({
        id: t.Numeric({
          description: "Game ID to delete",
          default: 1,
        }),
      }),
      detail: {
        tags: ["Games"],
        summary: "Delete game",
        description: "Delete a game entry (admin only).",
      },
    }
  );
