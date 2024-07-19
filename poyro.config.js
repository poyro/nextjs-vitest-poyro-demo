import defineConfig from "@poyro/vitest/config";

export default defineConfig({
  llamaCpp: {
    contextOptions: {
      contextSize: 1024,
    },
  },
});
