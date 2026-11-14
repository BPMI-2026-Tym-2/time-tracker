{
  description = "Task timer";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs = {nixpkgs, ...}: {
    devShells = nixpkgs.lib.genAttrs [
      "x86_64-linux"
      "aarch64-darwin"
      "x86_64-darwin"
    ] (system: let
      pkgs = nixpkgs.legacyPackages.${system};
      prismaEngines = pkgs.prisma-engines_6 or pkgs.prisma-engines;
    in {
      default = pkgs.mkShell ({
        packages = [
          pkgs.nodejs_22
          pkgs.mongosh
          pkgs.openssl
        ] ++ pkgs.lib.optionals pkgs.stdenv.isLinux [prismaEngines];

        shellHook = ''
          echo "Node.js: $(node --version)"
          echo "npm:     $(npm --version)"
        '' + pkgs.lib.optionalString pkgs.stdenv.isLinux ''
          echo "Prisma engines: $PRISMA_DEV_VERSION"
        '';
      } // pkgs.lib.optionalAttrs pkgs.stdenv.isLinux {
        PRISMA_SCHEMA_ENGINE_BINARY = "${prismaEngines}/bin/schema-engine";
        PRISMA_QUERY_ENGINE_LIBRARY = "${prismaEngines}/lib/libquery_engine.node";
        PRISMA_QUERY_ENGINE_BINARY = "${prismaEngines}/bin/query-engine";
        PRISMA_DEV_VERSION = prismaEngines.version;
      });
    });
  };
}