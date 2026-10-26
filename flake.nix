{
  description = "Task timer";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs = {nixpkgs, ...}: let
    system = "x86_64-linux";
    pkgs = import nixpkgs {inherit system;};
    prismaEngines = pkgs.prisma-engines_6 or pkgs.prisma-engines;
  in {
    devShells.${system}.default = pkgs.mkShell {
      packages = with pkgs; [
        nodejs_22
        mongosh
        openssl
        prismaEngines
      ];

      PRISMA_SCHEMA_ENGINE_BINARY = "${prismaEngines}/bin/schema-engine";

      PRISMA_QUERY_ENGINE_LIBRARY = "${prismaEngines}/lib/libquery_engine.node";

      PRISMA_QUERY_ENGINE_BINARY = "${prismaEngines}/bin/query-engine";

      PRISMA_DEV_VERSION = prismaEngines.version;

      shellHook = ''
        echo "Node.js: $(node --version)"
        echo "npm:     $(npm --version)"
        echo "Prisma engines: $PRISMA_DEV_VERSION"
      '';
    };
  };
}
