#!/bin/bash
# Construye la imagen y (re)despliega el stack «piano» en https://piano.cheru.org
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

DATA=/home/dietpi/data/containers/piano
mkdir -p "$DATA"

docker build -t piano:latest .
docker stack deploy -c piano-stack.yml piano
# Fuerza el reinicio para que use la imagen recién construida aunque el tag no cambie.
docker service update --force --quiet piano_piano >/dev/null
echo "✔  Desplegado en https://piano.cheru.org"
