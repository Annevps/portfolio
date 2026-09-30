// Passo 1: cole aqui os dois dados do seu projeto no Supabase
// (Project Settings > API): "Project URL" e a chave "anon public".
const SUPABASE_URL = "https://khktnihmmjdnjosnqkls.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_G7eu65EA3s8SrP633y1bDQ_0k-FOSJJ";

const banco = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);