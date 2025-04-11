{ pkgs, lib, config, inputs, ... }:

let
  pkgs-unstable = import inputs.nixpkgs-unstable { system = pkgs.stdenv.system; };
in {
  name = "storm-stack";

  dotenv.enable = true;
  dotenv.filename = [".env" ".env.local"];

  # https://devenv.sh/basics/
  env.DEFAULT_LOCALE = "en_US";
  env.DEFAULT_TIMEZONE = "America/New_York";

  # https://devenv.sh/packages/
  packages = [
    # Shell
    pkgs.zsh
    pkgs.zsh-autosuggestions
    pkgs.zsh-completions

    # Source Control
    pkgs.git
    pkgs.git-lfs
    pkgs.git-crypt
    pkgs.gh

    # Linting
    pkgs.zizmor
    pkgs.taplo
    pkgs.typos
  ];

  # https://devenv.sh/languages/
  languages.nix = {
    enable = true;
    lsp.package = pkgs.nixd;
  };
  languages.javascript = {
    enable = true;
    package = pkgs-unstable.nodejs;
    corepack.enable = true;
    pnpm = {
      enable = true;
      install.enable = true;
      package = pkgs-unstable.nodePackages.pnpm;
    };
  };
  languages.typescript.enable = true;

  # https://devenv.sh/processes/
  # processes.cargo-watch.exec = "cargo-watch";

  # https://devenv.sh/services/
  # services.postgres.enable = true;

  # https://devenv.sh/scripts/
  scripts = {
    bootstrap.exec = "pnpm bootstrap";
    build.exec = "pnpm build";
    build-dev.exec = "pnpm build-dev";
    lint.exec = "pnpm lint";
    format.exec = "pnpm format";
    nuke.exec = "pnpm nuke";
  };

  enterShell = ''
    bootstrap
  '';

  # https://devenv.sh/tasks/
  # tasks = {
  #   "myproj:setup".exec = "mytool build";
  #   "devenv:enterShell".after = [ "myproj:setup" ];
  # };

  # https://devenv.sh/tests/
  # enterTest = ''
  #   echo "Running tests"
  #   git --version | grep --color=auto "${pkgs.git.version}"
  # '';

  # https://devenv.sh/git-hooks/
  git-hooks.hooks = {
    build = {
      name = "Build";
      enable = true;
      entry = "build";
      pass_filenames = false;
    };
    shellcheck.enable = true;
  };

  # See full reference at https://devenv.sh/reference/options/
}

