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

export interface ExperiencePosition {
  title: string;
  date: string;
  description: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location: string | null;
  description: string;
  date: string;
  logo: string | null;
  positions: ExperiencePosition[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

const serializeExperience = (exp: any): Experience => ({
  ...exp,
  id: exp.id.toString(),
  positions: exp.positions ?? [],
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
    company: string;
    location?: string;
    logo?: string;
    positions: ExperiencePosition[];
    created_by: string;
    // legacy flat fields kept for DB NOT NULL constraint sync
    title?: string;
    date?: string;
    description?: string;
  },
  client: any = supabase,
): Promise<Experience> {
  try {
    const first = data.positions[0];
    const { data: exp, error } = await client
      .from("experiences")
      .insert([
        {
          company: data.company,
          location: data.location || null,
          logo: data.logo || null,
          positions: data.positions,
          // sync flat columns from first position (NOT NULL constraint)
          title: first?.title ?? "",
          date: first?.date ?? "",
          description: first?.description ?? "",
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
    company?: string;
    location?: string | null;
    logo?: string | null;
    positions?: ExperiencePosition[];
    // legacy flat fields (still accepted for backward compat)
    title?: string;
    date?: string;
    description?: string;
  }>,
  client: any = supabase,
): Promise<Experience> {
  try {
    const existing = await getExperience(id, client);
    if (!existing) throw new Error("Experience not found");

    const updateData: any = {};
    if (data.company !== undefined) updateData.company = data.company;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.logo !== undefined) updateData.logo = data.logo;
    if (data.positions !== undefined) {
      updateData.positions = data.positions;
      // sync flat columns from first position
      const first = data.positions[0];
      if (first) {
        updateData.title = first.title;
        updateData.date = first.date;
        updateData.description = first.description;
      }
    }

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

// ============================================================================
// CERTIFICATION QUERIES
// ============================================================================

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  date: string | null;
  icon: string | null;
  image_url: string | null;
  url: string | null;
  created_at: string;
  created_by: string;
}

const serializeCertification = (cert: any): Certification => ({
  ...cert,
  id: cert.id.toString(),
  url: cert.url ?? null,
});

export async function getCertifications(): Promise<Certification[]> {
  try {
    const { data, error } = await supabase
      .from("certifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(serializeCertification);
  } catch (error) {
    console.error("Error fetching certifications:", error);
    throw error;
  }
}

export async function getCertification(
  id: string | bigint,
  client: any = supabase,
): Promise<Certification | null> {
  try {
    const certId = typeof id === "bigint" ? id.toString() : id;

    const { data, error } = await client
      .from("certifications")
      .select("*")
      .eq("id", certId)
      .single();

    if (error && error.code === "PGRST116") return null;
    if (error) throw error;

    return data ? serializeCertification(data) : null;
  } catch (error) {
    console.error("Error fetching certification:", error);
    throw error;
  }
}

export async function createCertification(
  data: {
    title: string;
    issuer: string;
    date?: string | null;
    icon?: string | null;
    image_url?: string | null;
    url?: string | null;
    created_by: string;
  },
  client: any = supabase,
): Promise<Certification> {
  try {
    const { data: cert, error } = await client
      .from("certifications")
      .insert([
        {
          title: data.title,
          issuer: data.issuer,
          date: data.date || null,
          icon: data.icon || null,
          image_url: data.image_url || null,
          url: data.url || null,
          created_by: data.created_by,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return serializeCertification(cert);
  } catch (error) {
    console.error("Error creating certification:", error);
    throw error;
  }
}

export async function updateCertification(
  id: string | bigint,
  data: Partial<{
    title?: string;
    issuer?: string;
    date?: string | null;
    icon?: string | null;
    image_url?: string | null;
    url?: string | null;
  }>,
  client: any = supabase,
): Promise<Certification> {
  try {
    const existing = await getCertification(id, client);
    if (!existing) throw new Error("Certification not found");

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.issuer !== undefined) updateData.issuer = data.issuer;
    if (data.date !== undefined) updateData.date = data.date;
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.image_url !== undefined) updateData.image_url = data.image_url;
    if (data.url !== undefined) updateData.url = data.url;

    const certId = typeof id === "bigint" ? id.toString() : id;

    const { error } = await client
      .from("certifications")
      .update(updateData)
      .eq("id", certId);

    if (error) throw error;

    const updated = await getCertification(certId, client);
    if (!updated) throw new Error("Certification not found after update");
    return updated;
  } catch (error) {
    console.error("Error updating certification:", error);
    throw error;
  }
}

export async function deleteCertification(
  id: string | bigint,
  client: any = supabase,
): Promise<void> {
  try {
    const certId = typeof id === "bigint" ? id.toString() : id;

    const { error } = await client
      .from("certifications")
      .delete()
      .eq("id", certId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting certification:", error);
    throw error;
  }
}

// ============================================================================
// SONG QUERIES
// ============================================================================

export interface Song {
  id: string;
  title: string;
  artist: string;
  youtube_url: string;
  bg_image_url: string;
  art_credit: string | null;
  created_by: string;
  created_at: string;
}

const serializeSong = (song: any): Song => ({
  ...song,
  id: song.id.toString(),
});

export async function getSongs(): Promise<Song[]> {
  try {
    const { data, error } = await supabase
      .from("songs")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return (data || []).map(serializeSong);
  } catch (error) {
    console.error("Error fetching songs:", error);
    throw error;
  }
}

export async function getSong(
  id: string | bigint,
  client: any = supabase,
): Promise<Song | null> {
  try {
    const songId = typeof id === "bigint" ? id.toString() : id;

    const { data, error } = await client
      .from("songs")
      .select("*")
      .eq("id", songId)
      .single();

    if (error && error.code === "PGRST116") return null;
    if (error) throw error;

    return data ? serializeSong(data) : null;
  } catch (error) {
    console.error("Error fetching song:", error);
    throw error;
  }
}

export async function createSong(
  data: {
    title: string;
    artist: string;
    youtube_url: string;
    bg_image_url: string;
    art_credit?: string | null;
    created_by: string;
  },
  client: any = supabase,
): Promise<Song> {
  try {
    const { data: song, error } = await client
      .from("songs")
      .insert([
        {
          title: data.title,
          artist: data.artist,
          youtube_url: data.youtube_url,
          bg_image_url: data.bg_image_url,
          art_credit: data.art_credit || null,
          created_by: data.created_by,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return serializeSong(song);
  } catch (error) {
    console.error("Error creating song:", error);
    throw error;
  }
}

export async function updateSong(
  id: string | bigint,
  data: Partial<{
    title?: string;
    artist?: string;
    youtube_url?: string;
    bg_image_url?: string;
    art_credit?: string | null;
  }>,
  client: any = supabase,
): Promise<Song> {
  try {
    const existing = await getSong(id, client);
    if (!existing) throw new Error("Song not found");

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.artist !== undefined) updateData.artist = data.artist;
    if (data.youtube_url !== undefined) updateData.youtube_url = data.youtube_url;
    if (data.bg_image_url !== undefined) updateData.bg_image_url = data.bg_image_url;
    if (data.art_credit !== undefined) updateData.art_credit = data.art_credit;

    const songId = typeof id === "bigint" ? id.toString() : id;

    const { error } = await client
      .from("songs")
      .update(updateData)
      .eq("id", songId);

    if (error) throw error;

    const updated = await getSong(songId, client);
    if (!updated) throw new Error("Song not found after update");
    return updated;
  } catch (error) {
    console.error("Error updating song:", error);
    throw error;
  }
}

export async function deleteSong(
  id: string | bigint,
  client: any = supabase,
): Promise<void> {
  try {
    const songId = typeof id === "bigint" ? id.toString() : id;

    const { error } = await client.from("songs").delete().eq("id", songId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting song:", error);
    throw error;
  }
}

