import { Elysia, t } from "elysia";
import { cookie } from "@elysiajs/cookie";
import {
  getGames,
  getGame,
  createGame,
  updateGame,
  deleteGame,
  type Game,
} from "../libs/db";
import { requireAuth } from "../middleware/auth";

export const gameRoutes = new Elysia({ prefix: "/api/games" })
  .use(cookie())
  // Get all games (public access)
  .get(
    "/",
    async ({ query, set }) => {
      try {
        const games = await getGames(query.genre, query.platform);
        return { games };
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
              description:
                "Filter games by genre. Use lowercase with hyphens. Omit to fetch all games.",
            }
          )
        ),
        platform: t.Optional(
          t.Union(
            [t.Literal("pc"), t.Literal("mobile"), t.Literal("playstation")],
            {
              description:
                "Filter games by platform. Use lowercase. Omit to fetch all games.",
            }
          )
        ),
      }),
      detail: {
        tags: ["Games"],
        summary: "Get all games",
        description:
          "Retrieve all games (public access). Can be filtered by genre or platform using URL-friendly format (e.g., 'rpg', 'action-rpg', 'pc'). Omit genre and platform parameters to get all games.",
      },
    }
  )

  // Get a single game by ID (public access)
  .get(
    "/:id",
    async ({ params, set }) => {
      try {
        const game = await getGame(BigInt(params.id));

        if (!game) {
          set.status = 404;
          return { error: "Game not found" };
        }

        return { game };
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

        const game = await createGame({
          title: body.title,
          description: body.description,
          genre: body.genre,
          platform: body.platform,
          link: body.link,
          game_img: body.icon_img,
          created_by: user!.id,
        });

        return {
          message: "Game created successfully",
          game,
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
        const { supabase: authClient } = await requireAuth({ cookie, set });

        const updateData: Partial<Game> = {};
        if (body.title !== undefined) updateData.title = body.title;
        if (body.description !== undefined)
          updateData.description = body.description;
        if (body.platform !== undefined) {
          updateData.platform = body.platform;
        }
        if (body.genre !== undefined) {
          updateData.genre = body.genre;
        }
        if (body.link !== undefined) updateData.link = body.link;

        const game = await updateGame(
          BigInt(params.id),
          updateData,
          authClient
        );

        return {
          message: "Game updated successfully",
          game,
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
        const { supabase: authClient } = await requireAuth({ cookie, set });

        await deleteGame(BigInt(params.id), authClient);

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
