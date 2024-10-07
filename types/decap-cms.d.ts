declare module "decap-cms" {
  interface CMSConfig {
    backend: {
      name: string;
      repo: string;
      branch: string;
      auth?: {
        clientId: string;
        clientSecret: string;
      };
    };
    media_folder: string;
    collections: Array<{
      name: string;
      label: string;
      folder: string;
      create: boolean;
      slug: string;
      fields: Array<{
        label: string;
        name: string;
        widget: string;
      }>;
    }>;
  }

  const CMS: React.FC<{ config?: CMSConfig }>;
  export default CMS;
}
