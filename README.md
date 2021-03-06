# Kolide [![CircleCI](https://circleci.com/gh/kolide/kolide-ose.svg?style=svg&circle-token=2573c239b7f18967040d2dec95ca5f71cfc90693)](https://circleci.com/gh/kolide/kolide-ose)

### Contents

- [Development Environment](#development-environment)
  - [Installing build dependencies](#installing-build-dependencies)
  - [Building](#building)
    - [Generating the packaged JavaScript](#generating-the-packaged-javascript)
    - [Automatic rebuilding of the JavaScript bundle](#automatic-rebuilding-of-the-javascript-bundle)
    - [Compiling the Kolide binary](#compiling-the-kolide-binary)
    - [Managing Go dependencies with glide](#managing-go-dependencies-with-glide)
    - [Database Modifications](#database-modifications)
  - [Testing](#testing)
    - [Full test suite](#full-test-suite)
    - [Go unit tests](#go-unit-tests)
    - [JavaScript unit tests](#javascript-unit-tests)
    - [Go linters](#go-linters)
    - [JavaScript linters](#javascript-linters)
    - [Viewing test coverage](#viewing-test-coverage)
  - [Email](#email)
    - [Testing email using MailHog](#testing-email-using-mailhog)
    - [Viewing email content in the terminal](#viewing-email-content-in-the-terminal)
  - [Development Infrastructure](#development-infrastructure)
    - [Starting the local development environment](#starting-the-local-development-environment)
    - [Stopping the local development environment](#stopping-the-local-development-environment)
    - [Setting up the database tables](#setting-up-the-database-tables)
  - [Running Kolide](#running-kolide)
    - [Using Docker development infrastructure](#using-docker-development-infrastructure)


## Development Environment

### Installing build dependencies

To setup a working local development environment, you must install the following
minimum toolset:

* [Go](https://golang.org/dl/) (1.7 or greater)
* [Node.js](https://nodejs.org/en/download/current/) (and npm)
* [GNU Make](https://www.gnu.org/software/make/)
* [Docker](https://www.docker.com/products/overview#/install_the_platform)


If you're using MacOS or Linux, Make should be installed by default. If you
are using Windows, you will need to install it separately. Additionally, if you
would only like to run an in-memory instance of Kolide (for demonstrations,
testing, etc.), then you do not need to install Docker.

Once you have those minimum requirements, you will need to install Kolide's
dependent libraries. To do this, run the following:

```
make deps
```

When pulling in new revisions to your working source tree, it may be necessary
to re-run `make deps` if a new Go or JavaScript dependency was added.


```
make generate
```

#### Generating the packaged JavaScript

To generate all necessary code (bundling JavaScript into Go, etc), run the
following:

```
make generate
```

#### Automatic rebuilding of the JavaScript bundle

Normally, `make generate` takes the JavaScript code, bundles it into a single
bundle via Webpack, and inlines that bundle into a generated Go source file so
that all of the frontend code can be statically compiled into the binary. When
you build the code after running `make generate`, all of that JavaScript is
included in the binary.

This makes deploying Kolide a dream, since you only have to worry about a single
static binary. If you are working on frontend code, it is likely that you don't
want to have to manually re-run `make generate` and `make build` every time you
edit JavaScript and CSS in order to see your changes in the browser. To solve
this problem, before you build the Kolide binary, run the following command
instead of `make generate`:

```
make generate-dev
```

Instead of reading the JavaScript from a inlined static bundle compiled within
the binary, `make generate-dev` will generate a Go source file which reads the
frontend code from disk and run Webpack in "watch mode".

Note that when you run `make generate-dev`, Webpack will be watching the
JavaScript files that were used to generate the bundle, so the process will be
long lived. Depending on your personal workflow, you might want to run this in a
background terminal window.

After you run `make generate-dev`, run `make build` to build the binary, launch
the binary and you'll be able to refresh the browser whenever you edit and save
frontend code.

#### Compiling the Kolide binary

Use `go build` to build the application code. For your convenience, a make
command is included which builds the code:

```
make build
```

It's not necessary to use Make to build the code, but using Make allows us to
account for cross-platform differences more effectively than the `go build` tool
when writing automated tooling. Use whichever you prefer.

#### Managing Go Dependencies with Glide

[Glide](https://github.com/Masterminds/glide#glide-vendor-package-management-for-golang)
is a package manager for third party Go libraries. See the ["How It Works"](https://github.com/Masterminds/glide#how-it-works)
section in the Glide README for full details.

##### Installing the correct versions of dependencies

To install the correct versions of third package libraries, use `glide install`.
`glide install` will  use the `glide.lock` file to pull vendored packages from
remote vcs.  `make deps` takes care of this step, as well as downloading the
latest version of glide for you.

##### Adding new dependencies

To add a new dependency, use [`glide get [package name]`](https://github.com/Masterminds/glide#glide-get-package-name)

##### Updating dependencies

To update, use [`glide up`](https://github.com/Masterminds/glide#glide-update-aliased-to-up) which will use VCS and `glide.yaml` to figure out the correct updates.

##### Testing application code with glide

#### Database Modifications

##### Adding/Updating tables

Database schemas are managed by a series of migrations defined in go code. We
use a customized version of the Goose migrations tool to handle these
migrations.

Note: Once committed to the Kolide repo, table migrations should be considered
immutable. Any changes to an existing table should take place in a new
migration executing ALTERs.

  * From the project root run the following shell commands:

  ``` bash
  go get github.com/kolide/goose
  cd server/datastore/mysql/migrations/tables
  goose create AddColumnFooToUsers
  ```

  * Find the file you created in the migrations directory and edit it

  ``` go
  package migration

  import (
  	"database/sql"

  	"github.com/kolide/goose"
  )

  func init() {
  	goose.AddMigration(Up_20161118212656, Down_20161118212656)
  }

  func Up_20161118212656(tx *sql.Tx) error {
  	_, err := tx.Exec("ALTER TABLE `users` ADD COLUMN `foo` varchar(10) NOT NULL;")
  	return err
  }

  func Down_20161118212656(tx *sql.Tx) error {
  	_, err := tx.Exec("ALTER TABLE `users` DROP COLUMN `foo`;")
  	return err
  }
  ```

  * Update the database by running the following shell commands:

  ``` bash
  make build
  build/kolide prepare db
  ```

##### Populating the database

Populating built in data is also performed through migrations. All table
migrations are performed before any data migrations.

Note: Data migrations can be mutable. If tables are altered in a way that would
render a data migration invalid (columns changed/removed), data migrations
should be updated to comply with the new schema. Data migrations will not be
re-run when they have already been run against a database, but they must be
updated to maintain compatibility with a fresh DB.

  * From the project root run the following shell commands:

  ``` bash
  go get github.com/kolide/goose
  cd server/datastore/mysql/migrations/data
  goose create PopulateFoo
  ```

  * Proceed as for table migrations, editing and running the newly created
    migration file.


### Testing

#### Full test suite

To execute all of the tests that CI will execute, run the following from the
root of the repository:

```
make test
```

It is a good idea to run `make test` before submitting a Pull Request.

#### Go unit tests

To run all Go unit tests, run the following:

```
make test-go
```

### Database Tests

To run database tests set environment variables as follows.

```
export MYSQL_PORT_3306_TCP_ADDR=192.168.99.100
export MYSQL_TEST=1
```

### Email Tests

To run email related unit tests using MailHog set the following environment
variable.

```
export MAIL_TEST=1
```

#### JavaScript unit tests

To run all JavaScript unit tests, run the following:

```
make test-js
```

#### Go linters

To run all Go linters and static analyzers, run the following:

```
make lint-go
```

# Integration Tests

By default, tests that require external dependecies like Mysql or Redis are
skipped. The tests can be enabled by setting `MYSQL_TEST=true` and
`REDIS_TEST=true` environment variables. MYSQL will try to connect with the
following credentials.
```
user        = "kolide"
password    = "kolide"
database    = "kolide"
host        = "127.0.0.1"
```
Redis tests expect a redis instance at `127.0.0.1:6379`.


Both the Redis and MySQL tests will also be automatically enabled with Docker
links. You can check out the CircleCI configuration file(`circle.yml`) for an example of
how to use Docker links to run integration tests.
#### JavaScript linters

To run all JavaScript linters and static analyzers, run the following:

```
make lint-js
```

#### Viewing test coverage

When you run `make test` or `make test-go` from the root of the repository, test
coverage reports are generated in every subpackage. For example, the `server`
subpackage will have a coverage report generated in `./server/server.cover`

To explore a test coverage report on a line-by-line basis in the browser, run
the following:

```bash
# substitute ./datastore/datastore.cover, etc
go tool cover -html=./server/server.cover
```

To view test a test coverage report in a terminal, run the following:

```bash
# substitute ./datastore/datastore.cover, etc
go tool cover -func=./server/server.cover
```

### Email

#### Testing email using MailHog

To intercept sent emails while running a Kolide development environment, make
sure that you've set the SMTP address to `<docker host ip>:1025` and leave the
username and password blank. Then, visit `<docker host ip>:8025` in a web
browser to view the [MailHog](https://github.com/mailhog/MailHog) UI.

For example, if docker is running natively on your `localhost`, then your mail
settings should look something like:

```yaml
mail:
  address: localhost:1025
```

`localhost:1025` is the default configuration. You can use `kolide config_dump`
to see the values which Kolide is using given your configuration.

#### Viewing email content in the terminal

If you're [running Kolide in dev mode](#using-no-external-dependencies), emails
will be printed to the terminal instead of being sent via an SMTP server. This
may be useful if you want to view the content of all emails that Kolide sends.

### Development infrastructure

#### Starting the local development environment

To set up a canonical development environment via docker,
run the following from the root of the repository:

```
docker-compose up
```

This requires that you have docker installed. At this point in time,
automatic configuration tools are not included with this project.


#### Stopping the local development environment

If you'd like to shut down the virtual infrastructure created by docker, run
the following from the root of the repository:

```
docker-compose down
```

#### Setting up the database tables

Once you `docker-compose up` and are running the databases, you can build
the code and run the following command to create the database tables:

```
kolide prepare db
```

### Running Kolide

#### Using Docker development infrastructure

To start the Kolide server backed by the Docker development infrasturcture, run
the Kolide binary as follows:

```
kolide serve
```

By default, Kolide will try to connect to servers running on default ports on
localhost.

If you're using Docker via [Docker Toolbox](https://www.docker.com/products/docker-toolbox).
you may have to modify the default values use the output of `docker-machine ip`
instead of `localhost`.There is an example configuration file included in this
repository to make this process easier for you.  Use the `--config` flag of the
Kolide binary to specify the path to your config. See `kolide --help` for more
options.
