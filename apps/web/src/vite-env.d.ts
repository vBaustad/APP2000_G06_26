/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.webp";
declare module "*.avif";
declare module "*.svg";

declare module "./pages/RedigerProfil" {
  const RedigerProfil: unknown;
  export default RedigerProfil;
}
declare module "./pages/RedigerProfil.jsx" {
  const RedigerProfil: unknown;
  export default RedigerProfil;
}