import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { default: supabase } = await import('../src/config/supabase.js');

const PROFESSIONS = [
  "Actor / theatre actor", "RJ", "Editor", "Cinematographer DOP Cameraman", "Dancer",
  "Fashion Costume Designer", "Group Performance", "Lyricist", "Magician", "Makeup Artist",
  "Musician", "Photographer", "Child Artist", "Music Composer And Arranger", "beatboxer",
  "cartoonist", "DIY artist", "graffti artist", "sand artist", "rapper", "vlogger",
  "tattoo artist", "portrait artist / painter", "sculptor", "set designer", "aerial artist",
  "craftsmen", "fight choreographer", "micro artist", "mimer", "paper artist", "Singer",
  "Sound Expert", "Stunt Director / theatre stunt man", "Stylist", "VFX Expert",
  "Host Anchor Emcee VJ", "Voice Over Artist", "Writer", "Model", "Animator", "Art Director",
  "Band", "Choreographer", "Director", "DJ", "News Reader And Anchor", "Publicity Designer",
  "Stand Up Comedian", "poet"
];

const FIELDS_MAPPING = {
  "Choreographer": [
    { field_name: "Age", field_type: "number" },
    { field_name: "Gender", field_type: "select", options: ["Male", "Female", "Other"] },
    { field_name: "Dance forms known", field_type: "multiselect", options: ["Hip hop", "Bollywood", "Traditional", "Contemporary", "Salsa"] },
    { field_name: "Professional course completed", field_type: "text" },
    { field_name: "Previous projects", field_type: "text" },
    { field_name: "Number of Crew Members", field_type: "number" },
    { field_name: "Your Latest Performance video (Youtube link)", field_type: "text" }
  ],
  "Model": [
    { field_name: "Age", field_type: "number" },
    { field_name: "Gender", field_type: "select", options: ["Male", "Female"] },
    { field_name: "Height", field_type: "text" },
    { field_name: "Weight", field_type: "text" },
    { field_name: "Waist", field_type: "text" },
    { field_name: "Bust", field_type: "text" },
    { field_name: "Chest", field_type: "text" },
    { field_name: "Fits in 40R Jacket", field_type: "boolean" },
    { field_name: "Hips", field_type: "text" },
    { field_name: "Skin Tone", field_type: "text" },
    { field_name: "Hair Color", field_type: "text" },
    { field_name: "Eye Color", field_type: "text" },
    { field_name: "Shoe Size", field_type: "number" },
    { field_name: "Modelling Course attended", field_type: "text" },
    { field_name: "Previous Experience", field_type: "text" },
    { field_name: "Ads", field_type: "text" },
    { field_name: "Photoshoot", field_type: "text" },
    { field_name: "Rampwalk", field_type: "text" }
  ],
  "Band": [
    { field_name: "Number of Members", field_type: "number" },
    { field_name: "Vocalist", field_type: "text" },
    { field_name: "Drummer", field_type: "text" },
    { field_name: "Guitarist", field_type: "text" },
    { field_name: "Music", field_type: "select", options: ["Acoustic", "Electric"] },
    { field_name: "Language", field_type: "multiselect", options: ["English", "Hindi"] },
    { field_name: "Number of Songs Composed", field_type: "number" },
    { field_name: "Previous Performance Details", field_type: "text" }
  ],
  "Cinematographer DOP Cameraman": [
    { field_name: "designation", field_type: "text" },
    { field_name: "location", field_type: "text" },
    { field_name: "type of shoot", field_type: "multiselect", options: ["documentry", "tv features", "news", "sport", "commercial", "aerial shoot", "coporate", "reality", "drama", "others"] },
    { field_name: "work permits", field_type: "text" },
    { field_name: "about me", field_type: "text" },
    { field_name: "video links", field_type: "text" },
    { field_name: "yrs in industry", field_type: "number" },
    { field_name: "CINTA member", field_type: "boolean" },
    { field_name: "education", field_type: "text" }
  ],
  "Stylist": [
    { field_name: "Primary Job Type", field_type: "text" },
    { field_name: "Secondary Job Type", field_type: "text" },
    { field_name: "Specialisms", field_type: "multiselect", options: ["Footwear", "Handbags", "Jewellery", "Ladies Casual Clothing", "Menswear", "Womenswear"] },
    { field_name: "Years in industry", field_type: "text" },
    { field_name: "Languages Spoken", field_type: "text" },
    { field_name: "Work Permits", field_type: "text" }
  ]
};

// Aliases based on "same as stylist" note in PDF
const STYLIST_ALIASES = [
  "beatboxer", "cartoonist", "DIY artist", "graffti artist", "sand artist", "rapper",
  "vlogger", "tattoo artist", "portrait artist / painter", "sculptor", "set designer",
  "aerial artist", "craftsmen", "fight choreographer", "micro artist", "mimer", "paper artist"
];

for (const alias of STYLIST_ALIASES) {
  FIELDS_MAPPING[alias] = FIELDS_MAPPING["Stylist"];
}

async function seedProfessions() {
  console.log('Starting Profession Seeding Process...');

  for (const profName of PROFESSIONS) {
    console.log(`Processing: ${profName}`);
    
    // 1. Insert Profession
    const { data: profData, error: profError } = await supabase
      .from('artist_professions')
      .upsert({ name: profName, is_active: true }, { onConflict: 'name' })
      .select()
      .single();

    if (profError) {
      console.error(`Error inserting profession ${profName}:`, profError);
      continue;
    }

    const professionId = profData.id;

    // 2. Insert Fields (if mapped)
    const fields = FIELDS_MAPPING[profName];
    if (fields) {
      // Clear existing fields to avoid duplicates
      await supabase.from('profession_fields').delete().eq('profession_id', professionId);

      const fieldsToInsert = fields.map((f, i) => ({
        profession_id: professionId,
        field_name: f.field_name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        field_label: f.field_name,
        field_type: f.field_type,
        options: f.options || null,
        is_required: false
      }));

      const { error: fieldError } = await supabase.from('profession_fields').insert(fieldsToInsert);
      
      if (fieldError) {
        console.error(`Error inserting fields for ${profName}:`, fieldError);
      } else {
        console.log(`  -> Inserted ${fields.length} dynamic fields.`);
      }
    }
  }

  console.log('\n✅ Seeding complete!');
  process.exit(0);
}

seedProfessions();
