import { Elysia, t } from "elysia";
import { cookie } from "@elysiajs/cookie";
import {
  getSongs,
  getSong,
  createSong,
  updateSong,
  deleteSong,
} from "../libs/db";
import { requireAuth } from "../middleware/auth";

export const songRoutes = new Elysia({ prefix: "/api/songs" })
  .use(cookie())
  // Get all songs (public access)
  .get(
    "/",
    async ({ set }) => {
      try {
        const songs = await getSongs();
        return { songs };
      } catch (error: any) {
        set.status = 500;
        return { error: error.message };
      }
    },
    {
      detail: {
        tags: ["Songs"],
        summary: "Get all songs",
        description: "Retrieve all songs ordered by creation date (public access).",
      },
    },
  )

  // Get a single song by ID (public access)
  .get(
    "/:id",
    async ({ params, set }) => {
      try {
        const song = await getSong(BigInt(params.id));
        if (!song) {
          set.status = 404;
          return { error: "Song not found" };
        }
        return { song };
      } catch (error: any) {
        set.status = 500;
        return { error: error.message };
      }
    },
    {
      params: t.Object({
        id: t.Numeric({ description: "Song ID", default: 1 }),
      }),
      detail: {
        tags: ["Songs"],
        summary: "Get song by ID",
        description: "Retrieve a single song by its ID (public access).",
      },
    },
  )

  // Create a new song (admin only)
  .post(
    "/",
    async ({ body, cookie, set }) => {
      try {
        const { user, supabase: authClient } = await requireAuth({ cookie, set });

        const song = await createSong(
          {
            title: body.title,
            artist: body.artist,
            youtube_url: body.youtube_url,
            bg_image_url: body.bg_image_url,
            art_credit: body.art_credit || null,
            created_by: user!.id,
          },
          authClient,
        );

        return { message: "Song created successfully", song };
      } catch (error: any) {
        set.status = 500;
        return { error: error.message };
      }
    },
    {
      body: t.Object({
        title: t.String({ description: "Song title", default: "Lofi Study" }),
        artist: t.String({ description: "Artist name", default: "Lofi Girl" }),
        youtube_url: t.String({
          description: "Full YouTube video URL",
          default: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
        }),
        bg_image_url: t.String({
          description: "Background image URL shown when this song is playing",
          default: "https://images.unsplash.com/photo-1518173946687-a4c8a383392e",
        }),
        art_credit: t.Optional(t.String({
          description: "Credit for the background art",
          default: "Unsplash",
        })),
      }),
      detail: {
        tags: ["Songs"],
        summary: "Create song",
        description: "Create a new song entry (admin only).",
      },
    },
  )

  // Update a song (admin only)
  .put(
    "/:id",
    async ({ params, body, cookie, set }) => {
      try {
        const { supabase: authClient } = await requireAuth({ cookie, set });

        const song = await updateSong(BigInt(params.id), body, authClient);

        return { message: "Song updated successfully", song };
      } catch (error: any) {
        set.status = 500;
        return { error: error.message };
      }
    },
    {
      params: t.Object({
        id: t.Numeric({ description: "Song ID to update", default: 1 }),
      }),
      body: t.Partial(
        t.Object({
          title: t.String({ description: "Song title" }),
          artist: t.String({ description: "Artist name" }),
          youtube_url: t.String({ description: "YouTube video URL" }),
          bg_image_url: t.String({ description: "Background image URL" }),
          art_credit: t.String({ description: "Background art credit" }),
        }),
      ),
      detail: {
        tags: ["Songs"],
        summary: "Update song",
        description: "Update an existing song entry (admin only).",
      },
    },
  )

  // Delete a song (admin only)
  .delete(
    "/:id",
    async ({ params, cookie, set }) => {
      try {
        const { supabase: authClient } = await requireAuth({ cookie, set });
        await deleteSong(BigInt(params.id), authClient);
        return { message: "Song deleted successfully" };
      } catch (error: any) {
        set.status = 500;
        return { error: error.message };
      }
    },
    {
      params: t.Object({
        id: t.Numeric({ description: "Song ID to delete", default: 1 }),
      }),
      detail: {
        tags: ["Songs"],
        summary: "Delete song",
        description: "Delete a song entry (admin only).",
      },
    },
  );
