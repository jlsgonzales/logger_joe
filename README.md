# Logger Joe

Welcome to Logger Joe! A VS Code extension that aims to help you analyze long log files!

## Features

#### Log level

This feature is activated once the `Logger Joe: Parse/Unparse File` is triggered.
In this version, log level keywords are harcoded (case sensitive) as:

* INFO
* WARN
* ERROR
* FATAL
* DEBUG

#### Bookmarking

When investigating long log files, it is useful to bookmark certain lines to use as reference.
Logger Joe supports this feature under `Logger Joe: Remember/Forget` command

Navigate your bookmarked lines with `Logger Joe: Go to Next Remembered Line` and  `Logger Joe: Go to Previous Remembered Line`

#### Highlighting

Highlighting key phrases can be beneficial to make them standout in your investigation.
Logger Joe supports this feature under `Logger Joe: Highlight/Unhighlight` command.

In this version, Logger Joe can only highlight 50 words per file simultaneously.

#### Grep

Grep key phrases to help you investigate your log file with Logger Joe's `Logger Joe: Grep` command.

In this version, grep is supported in 4 modes depending on your needs:
* `Logger Joe: Grep To New Editor (Text)`
* `Logger Joe: Grep To Current Editor (Text)`
* `Logger Joe: Grep To New Editor (Regex)`
* `Logger Joe: Grep To Current Editor (Regex)`

## Future Features

Watch out for these exciting new features:

* Sidebar Integration
* Log streaming from external API
* Configurability (log level keywords)
* Persisted Markings
