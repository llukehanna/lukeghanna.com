#!/usr/bin/env bash
set -euo pipefail
npm run build
npx next start -p 3100 &
PID=$!
trap 'kill $PID' EXIT
for i in $(seq 1 30); do curl -sf http://localhost:3100 >/dev/null && break; sleep 1; done
mkdir -p .lighthouse
for path in / /work/bt; do
  name=$(echo "$path" | tr '/' '_')
  npx --yes lighthouse "http://localhost:3100$path" --preset=desktop --quiet --chrome-flags="--headless=new" --output=json --output-path=".lighthouse/desktop$name.json"
  npx --yes lighthouse "http://localhost:3100$path" --quiet --chrome-flags="--headless=new" --output=json --output-path=".lighthouse/mobile$name.json"
done
node -e '
const fs=require("fs");let fail=false;
for(const f of fs.readdirSync(".lighthouse")){const r=JSON.parse(fs.readFileSync(".lighthouse/"+f));
 const s=Object.fromEntries(Object.entries(r.categories).map(([k,v])=>[k,Math.round(v.score*100)]));
 console.log(f.padEnd(28),JSON.stringify(s));
 for(const k of ["performance","accessibility","best-practices","seo"]) if(s[k]<95) fail=true;}
process.exit(fail?1:0)'
