# Rollback Guide

## Retour au tag précédent

```bash
git fetch --tags
PREV_TAG=$(git describe --tags --abbrev=0 HEAD~1)
git checkout $PREV_TAG
```

## Relancer `release.yml`

Sur GitHub, allez dans **Actions → release.yml** puis cliquez sur **Run workflow** pour redéployer le tag.

## Docker

```bash
docker pull myapp:$PREV_TAG
docker run -d myapp:$PREV_TAG
```

## Vercel

```bash
vercel rollback $PREV_TAG
```

## Netlify

```bash
netlify deploy --prod --commit $PREV_TAG
```
