{
  pkgs ? import <nixpkgs> { },
}:

pkgs.mkShell {
  packages = with pkgs; [
    # Shell
    direnv
    zsh
    git
    gh

    # Development
    node2nix
    nodejs
    corepack
    pnpm
    nodePackages.typescript
    nodePackages.typescript-language-server
    nodePackages.prettier

    # Linting
    zizmor
    taplo
    typos
  ];
}
