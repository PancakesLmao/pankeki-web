import { supabase } from "./supabase";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Project {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  link: string | null;
  project_img: string | null;
  status: string;
  time_range: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Game {
  id: string;
  title: string;
  description: string | null;
  genre: string[];
  platform: string[];
  link: string | null;
  game_img: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// ============================================================================
// ENUM MAPPINGS (Games)
// ============================================================================

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

const reverseGenreMap: Record<string, string> = {
  Gacha: "gacha",
  Sci_Fi: "sci-fi",
  Fantasy: "fantasy",
  Hack_And_Slash: "hack-and-slash",
  Action_RPG: "action-rpg",
  RPG: "rpg",
  JRPG: "jrpg",
  Visual_Novel: "visual-novel",
  Turn_based: "turn-based",
  Open_World: "open-world",
};

const platformMap: Record<string, string> = {
  pc: "PC",
  mobile: "Mobile",
  playstation: "PlayStation",
};

const reversePlatformMap: Record<string, string> = {
  PC: "pc",
  Mobile: "mobile",
  PlayStation: "playstation",
};

// ============================================================================
// SERIALIZATION HELPERS
// ============================================================================

const serializeProject = (project: any): Project => ({
  ...project,
  id: project.id.toString(),
});

const serializeGame = (game: any): Game => ({
  ...game,
  id: game.id.toString(),
  genre: (game.genre || []).map((g: string) => reverseGenreMap[g] || g),
  platform: (game.platform || []).map(
    (p: string) => reversePlatformMap[p] || p
  ),
});

// ============================================================================
// PROJECT QUERIES
// ============================================================================

export async function getProjects(status?: string): Promise<Project[]> {
  try {
    let query = supabase.from("projects").select("*");

    if (status) {
      query = query.eq("status", status);
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map(serializeProject);
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
}

export async function getProject(
  id: string | bigint,
  client: any = supabase
): Promise<Project | null> {
  try {
    // Convert BigInt to string for consistency with Supabase
    const projectId = typeof id === "bigint" ? id.toString() : id;

    const { data, error } = await client
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (error && error.code === "PGRST116") {
      return null; // Not found
    }
    if (error) throw error;

    return data ? serializeProject(data) : null;
  } catch (error) {
    console.error("Error fetching project:", error);
    throw error;
  }
}

export async function createProject(data: {
  title: string;
  description?: string;
  tags: string[];
  link?: string;
  project_img?: string;
  status: string;
  time_range?: string;
  created_by: string;
}): Promise<Project> {
  try {
    console.log("DEBUG createProject - Input data:", JSON.stringify(data));

    const { data: project, error } = await supabase
      .from("projects")
      .insert([
        {
          title: data.title,
          description: data.description || null,
          tags: data.tags,
          link: data.link || null,
          project_img: data.project_img || null,
          status: data.status,
          time_range: data.time_range || null,
          created_by: data.created_by,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return serializeProject(project);
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
}

export async function updateProject(
  id: string | bigint,
  data: Partial<{
    title?: string;
    description?: string | null;
    tags?: string[];
    link?: string | null;
    project_img?: string | null;
    status?: string;
    time_range?: string | null;
  }>,
  client: any = supabase
): Promise<Project> {
  try {
    // Verify project exists first
    const existing = await getProject(id, client);
    if (!existing) {
      throw new Error("Project not found");
    }

    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.link !== undefined) updateData.link = data.link;
    if (data.project_img !== undefined)
      updateData.project_img = data.project_img;
    if (data.time_range !== undefined) updateData.time_range = data.time_range;
    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    // Convert id to string for consistency with Supabase
    const projectId = typeof id === "bigint" ? id.toString() : id;

    // Update project (RLS policy will ensure user owns it)
    const { error } = await client
      .from("projects")
      .update(updateData)
      .eq("id", projectId);

    if (error) {
      throw error;
    }

    // Fetch the updated project
    const updated = await getProject(projectId, client);
    if (!updated) {
      throw new Error("Project not found after update");
    }

    return updated;
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  }
}

export async function deleteProject(
  id: string | bigint,
  client: any = supabase
): Promise<void> {
  try {
    // Convert id to string for consistency with Supabase
    const projectId = typeof id === "bigint" ? id.toString() : id;

    const { error } = await client
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
}

// ============================================================================
// GAME QUERIES
// ============================================================================

export async function getGames(
  genre?: string,
  platform?: string
): Promise<Game[]> {
  try {
    let query = supabase.from("games").select("*");

    if (genre) {
      const dbGenre = genreMap[genre] || genre;
      query = query.contains("genre", [dbGenre]);
    }

    if (platform) {
      const dbPlatform = platformMap[platform] || platform;
      query = query.contains("platform", [dbPlatform]);
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map(serializeGame);
  } catch (error) {
    console.error("Error fetching games:", error);
    throw error;
  }
}

export async function getGame(
  id: string | bigint,
  client: any = supabase
): Promise<Game | null> {
  try {
    // Convert BigInt to string for consistency with Supabase
    const gameId = typeof id === "bigint" ? id.toString() : id;

    const { data, error } = await client
      .from("games")
      .select("*")
      .eq("id", gameId)
      .single();

    if (error && error.code === "PGRST116") {
      return null; // Not found
    }
    if (error) throw error;

    return data ? serializeGame(data) : null;
  } catch (error) {
    console.error("Error fetching game:", error);
    throw error;
  }
}

export async function createGame(data: {
  title: string;
  description?: string;
  genre: string[];
  platform: string[];
  link?: string;
  game_img?: string;
  created_by: string;
}): Promise<Game> {
  try {
    const dbGenre = data.genre.map((g) => genreMap[g] || g);
    const dbPlatform = data.platform.map((p) => platformMap[p] || p);

    const { data: game, error } = await supabase
      .from("games")
      .insert([
        {
          title: data.title,
          description: data.description || null,
          genre: dbGenre,
          platform: dbPlatform,
          link: data.link || null,
          game_img: data.game_img || null,
          created_by: data.created_by,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return serializeGame(game);
  } catch (error) {
    console.error("Error creating game:", error);
    throw error;
  }
}

export async function updateGame(
  id: string | bigint,
  data: Partial<{
    title?: string;
    description?: string | null;
    genre?: string[];
    platform?: string[];
    link?: string | null;
    game_img?: string | null;
  }>,
  client: any = supabase
): Promise<Game> {
  try {
    // Verify game exists first
    const existing = await getGame(id, client);
    if (!existing) {
      throw new Error("Game not found");
    }

    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.genre !== undefined) {
      updateData.genre = data.genre.map((g) => genreMap[g] || g);
    }
    if (data.platform !== undefined) {
      updateData.platform = data.platform.map((p) => platformMap[p] || p);
    }
    if (data.link !== undefined) updateData.link = data.link;
    if (data.game_img !== undefined) updateData.game_img = data.game_img;

    // Convert id to string for consistency with Supabase
    const gameId = typeof id === "bigint" ? id.toString() : id;

    const { error } = await client
      .from("games")
      .update(updateData)
      .eq("id", gameId);

    if (error) throw error;

    // Fetch the updated game
    const updated = await getGame(gameId, client);
    if (!updated) {
      throw new Error("Game not found after update");
    }

    return updated;
  } catch (error) {
    console.error("Error updating game:", error);
    throw error;
  }
}

export async function deleteGame(
  id: string | bigint,
  client: any = supabase
): Promise<void> {
  try {
    // Convert id to string for consistency with Supabase
    const gameId = typeof id === "bigint" ? id.toString() : id;

    const { error } = await client.from("games").delete().eq("id", gameId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting game:", error);
    throw error;
  }
}

// ============================================================================
// ENUM REFERENCE QUERIES
// ============================================================================

export async function getProjectStatuses(): Promise<
  Record<string, { dbValue: string; displayValue: string }>
> {
  return {
    "completed-and-published": {
      dbValue: "Completed_and_Published",
      displayValue: "Completed and Published",
    },
    ongoing: { dbValue: "Ongoing", displayValue: "Ongoing" },
    deprecated: { dbValue: "Deprecated", displayValue: "Deprecated" },
    "completed-and-documenting": {
      dbValue: "Completed_and_Documenting",
      displayValue: "Completed and Documenting",
    },
    upcoming: { dbValue: "Upcoming", displayValue: "Upcoming" },
    "under-maintenance": {
      dbValue: "Under_Maintenance",
      displayValue: "Under Maintenance",
    },
  };
}

export async function getGameGenres(): Promise<
  Record<string, { dbValue: string; displayValue: string }>
> {
  return {
    gacha: { dbValue: "Gacha", displayValue: "Gacha" },
    "sci-fi": { dbValue: "Sci_Fi", displayValue: "Sci-Fi" },
    fantasy: { dbValue: "Fantasy", displayValue: "Fantasy" },
    "hack-and-slash": {
      dbValue: "Hack_And_Slash",
      displayValue: "Hack and Slash",
    },
    "action-rpg": { dbValue: "Action_RPG", displayValue: "Action RPG" },
    rpg: { dbValue: "RPG", displayValue: "RPG" },
    jrpg: { dbValue: "JRPG", displayValue: "JRPG" },
    "visual-novel": {
      dbValue: "Visual_Novel",
      displayValue: "Visual Novel",
    },
    "turn-based": { dbValue: "Turn_based", displayValue: "Turn-based" },
    "open-world": { dbValue: "Open_World", displayValue: "Open World" },
  };
}

export async function getGamePlatforms(): Promise<
  Record<string, { dbValue: string; displayValue: string }>
> {
  return {
    pc: { dbValue: "PC", displayValue: "PC" },
    mobile: { dbValue: "Mobile", displayValue: "Mobile" },
    playstation: { dbValue: "PlayStation", displayValue: "PlayStation" },
  };
}
