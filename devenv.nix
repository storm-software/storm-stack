{ pkgs, config, ... }:
{
  name = "storm-software/storm-stack";

  dotenv.enable = true;
  dotenv.filename = [".env" ".env.local"];
  dotenv.disableHint = true;

  # https://devenv.sh/basics/
  env.DEFAULT_LOCALE = "en_US";
  env.DEFAULT_TIMEZONE = "America/New_York";

  # https://secretspec.dev/quick-start/
  # env.SENTRY_DSN = config.secretspec.secrets.SENTRY_DSN;

  # https://devenv.sh/packages/
  packages = [
    pkgs.capnproto
    pkgs.secretspec
  ];
}

