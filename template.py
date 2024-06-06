import shutil
from pathlib import Path

from youwol.pipelines.pipeline_typescript_weback_npm import (
    Template,
    PackageType,
    Dependencies,
    RunTimeDeps,
    generate_template,
    Bundles,
    MainModule,
    AuxiliaryModule,
)
from youwol.utils import parse_json

folder_path = Path(__file__).parent

pkg_json = parse_json(folder_path / "package.json")


template = Template(
    path=folder_path,
    type=PackageType.LIBRARY,
    name=pkg_json["name"],
    version=pkg_json["version"],
    shortDescription=pkg_json["description"],
    author=pkg_json["author"],
    dependencies=Dependencies(
        runTime=RunTimeDeps(
            externals={
                "@youwol/vsf-core": "^0.3.1",
                "rxjs": "^7.5.6",
                "@youwol/rx-tree-views": "^0.3.3",
                "@youwol/http-clients": "^3.0.1",
            }
        )
    ),
    bundles=Bundles(
        mainModule=MainModule(
            entryFile="./index.ts",
            loadDependencies=["@youwol/vsf-core", "rxjs"],
        ),
        auxiliaryModules=[
            AuxiliaryModule(
                name="explorer",
                entryFile="./lib/explorer/index.ts",
                loadDependencies=[
                    "@youwol/vsf-core",
                    "@youwol/rx-tree-views",
                    "rxjs",
                    "@youwol/http-clients",
                ],
            ),
            AuxiliaryModule(
                name="reader",
                entryFile="./lib/reader/index.ts",
                loadDependencies=[
                    "@youwol/vsf-core",
                    "rxjs",
                    "@youwol/http-clients",
                ],
            ),
        ],
    ),
    userGuide=True,
)

generate_template(template)
shutil.copyfile(
    src=folder_path / ".template" / "src" / "auto-generated.ts",
    dst=folder_path / "src" / "auto-generated.ts",
)
for file in [
    "README.md",
    ".gitignore",
    ".npmignore",
    ".prettierignore",
    "LICENSE",
    "package.json",
    "tsconfig.json",
    "webpack.config.ts",
]:
    shutil.copyfile(src=folder_path / ".template" / file, dst=folder_path / file)
