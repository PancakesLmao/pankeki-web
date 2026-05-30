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
  cover_img: string | null;
  icon_img: string | null;
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
  "sci-fi": "Sci-Fi",
  fantasy: "Fantasy",
  "hack-and-slash": "Hack And Slash",
  "action-rpg": "Action RPG",
  rpg: "RPG",
  jrpg: "JRPG",
  "visual-novel": "Visual Novel",
  "turn-based": "Turn-based",
  "open-world": "Open World",
  simulation: "Simulation",
};

const reverseGenreMap: Record<string, string> = {
  Gacha: "gacha",
  "Sci-Fi": "sci-fi",
  Fantasy: "fantasy",
  "Hack And Slash": "hack-and-slash",
  "Action RPG": "action-rpg",
  RPG: "rpg",
  JRPG: "jrpg",
  "Visual Novel": "visual-novel",
  "Turn-based": "turn-based",
  "Open World": "open-world",
  Simulation: "simulation",
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
    (p: string) => reversePlatformMap[p] || p,
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
  client: any = supabase,
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

export async function createProject(
  data: {
    title: string;
    description?: string;
    tags: string[];
    link?: string;
    project_img?: string;
    status: string;
    time_range?: string;
    created_by: string;
  },
  client: any = supabase,
): Promise<Project> {
  try {
    console.log("DEBUG createProject - Input data:", JSON.stringify(data));

    const { data: project, error } = await client
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
  client: any = supabase,
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
  client: any = supabase,
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
  platform?: string,
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
  client: any = supabase,
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

export async function createGame(
  data: {
    title: string;
    description?: string;
    genre: string[];
    platform: string[];
    link?: string;
    cover_img?: string;
    icon_img?: string;
    created_by: string;
  },
  client: any = supabase,
): Promise<Game> {
  try {
    const dbGenre = data.genre.map((g) => genreMap[g] || g);
    const dbPlatform = data.platform.map((p) => platformMap[p] || p);

    const { data: game, error } = await client
      .from("games")
      .insert([
        {
          title: data.title,
          description: data.description || null,
          genre: dbGenre,
          platform: dbPlatform,
          link: data.link || null,
          cover_img: data.cover_img || null,
          icon_img: data.icon_img || null,
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
    cover_img?: string | null;
    icon_img?: string | null;
  }>,
  client: any = supabase,
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
    if (data.cover_img !== undefined) updateData.cover_img = data.cover_img;
    if (data.icon_img !== undefined) updateData.icon_img = data.icon_img;

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
  client: any = supabase,
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
    "sci-fi": { dbValue: "Sci-Fi", displayValue: "Sci-Fi" },
    fantasy: { dbValue: "Fantasy", displayValue: "Fantasy" },
    "hack-and-slash": {
      dbValue: "Hack And Slash",
      displayValue: "Hack and Slash",
    },
    "action-rpg": { dbValue: "Action RPG", displayValue: "Action RPG" },
    rpg: { dbValue: "RPG", displayValue: "RPG" },
    jrpg: { dbValue: "JRPG", displayValue: "JRPG" },
    "visual-novel": {
      dbValue: "Visual Novel",
      displayValue: "Visual Novel",
    },
    "turn-based": { dbValue: "Turn-based", displayValue: "Turn-based" },
    "open-world": { dbValue: "Open World", displayValue: "Open World" },
    simulation: { dbValue: "Simulation", displayValue: "Simulation" },
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

// ============================================================================
// EXPERIENCE QUERIES
// ============================================================================

export interface Experience {
  id: string;
  title: string;
  company: string;
  location: string | null;
  description: string;
  date: string;
  logo: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const serializeExperience = (exp: any): Experience => ({
  ...exp,
  id: exp.id.toString(),
});

export async function getExperiences(): Promise<Experience[]> {
  try {
    const { data, error } = await supabase
      .from("experiences")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(serializeExperience);
  } catch (error) {
    console.error("Error fetching experiences:", error);
    throw error;
  }
}

export async function getExperience(
  id: string | bigint,
  client: any = supabase,
): Promise<Experience | null> {
  try {
    const expId = typeof id === "bigint" ? id.toString() : id;

    const { data, error } = await client
      .from("experiences")
      .select("*")
      .eq("id", expId)
      .single();

    if (error && error.code === "PGRST116") return null;
    if (error) throw error;

    return data ? serializeExperience(data) : null;
  } catch (error) {
    console.error("Error fetching experience:", error);
    throw error;
  }
}

export async function createExperience(
  data: {
    title: string;
    company: string;
    location?: string;
    description: string;
    date: string;
    logo?: string;
    created_by: string;
  },
  client: any = supabase,
): Promise<Experience> {
  try {
    const { data: exp, error } = await client
      .from("experiences")
      .insert([
        {
          title: data.title,
          company: data.company,
          location: data.location || null,
          description: data.description,
          date: data.date,
          logo: data.logo || null,
          created_by: data.created_by,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return serializeExperience(exp);
  } catch (error) {
    console.error("Error creating experience:", error);
    throw error;
  }
}

export async function updateExperience(
  id: string | bigint,
  data: Partial<{
    title?: string;
    company?: string;
    location?: string | null;
    description?: string;
    date?: string;
    logo?: string | null;
  }>,
  client: any = supabase,
): Promise<Experience> {
  try {
    const existing = await getExperience(id, client);
    if (!existing) throw new Error("Experience not found");

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.company !== undefined) updateData.company = data.company;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.date !== undefined) updateData.date = data.date;
    if (data.logo !== undefined) updateData.logo = data.logo;

    const expId = typeof id === "bigint" ? id.toString() : id;

    const { error } = await client
      .from("experiences")
      .update(updateData)
      .eq("id", expId);

    if (error) throw error;

    const updated = await getExperience(expId, client);
    if (!updated) throw new Error("Experience not found after update");
    return updated;
  } catch (error) {
    console.error("Error updating experience:", error);
    throw error;
  }
}

export async function deleteExperience(
  id: string | bigint,
  client: any = supabase,
): Promise<void> {
  try {
    const expId = typeof id === "bigint" ? id.toString() : id;

    const { error } = await client.from("experiences").delete().eq("id", expId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting experience:", error);
    throw error;
  }
}
