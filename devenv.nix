{ ... }:
{
  name = "storm-software/storm-stack";

  dotenv.enable = true;
  dotenv.filename = [".env" ".env.local"];

  # https://devenv.sh/basics/
  env.DEFAULT_LOCALE = "en_US";
  env.DEFAULT_TIMEZONE = "America/New_York";
  # env.NX_DAEMON = false;

  # See full reference at https://devenv.sh/reference/options/
}

