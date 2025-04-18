{ config, ... }:
{
  name = "storm-software/storm-stack";

  dotenv.enable = true;
  dotenv.filename = [".env" ".env.local"];

  # https://devenv.sh/basics/
  env.DEFAULT_LOCALE = "en_US";
  env.DEFAULT_TIMEZONE = "America/New_York";
  env.STORM_CONFIG_DIRECTORY = "${config.devenv.root}/.config";
  env.STORM_CACHE_DIRECTORY = "${config.devenv.root}/tmp/.cache";
  env.STORM_DATA_DIRECTORY = "${config.devenv.root}/tmp/.local/share";
  env.STORM_TEMP_DIRECTORY = "${config.devenv.root}/tmp/.runtime";

  # See full reference at https://devenv.sh/reference/options/
}

