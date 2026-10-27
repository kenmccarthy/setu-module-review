# Deploying to the SETU web server

This guide covers publishing the SETU AI Integration Review at **https://ai.setu.ie/review/**,
with the Classic tool at **https://ai.setu.ie/review/classic/**.

The site is plain static files: HTML, JavaScript, CSS and an SVG icon. The server needs no
Node.js, npm, database or server-side code. Everything a user enters is stored in their own
browser.

GitHub Pages (https://kenmccarthy.github.io/setu-module-review/) is published separately and is
not affected by anything in this guide.

## 1. Download the package

1. In the repository on GitHub, open **Actions** and choose the workflow **Build SETU web-server
   package**.
2. Choose how to get a run:
   - It runs automatically on every push to `main` and on every pull request, so normally you can
     open the latest successful run (green tick) for `main`.
   - To build on demand, choose **Run workflow**, pick the branch (normally `main`) and confirm.
     This button appears only once the workflow is on `main`.
3. Open the run. At the bottom of the summary page, under **Artifacts**, download
   **setu-ai-review-webserver-&lt;commit&gt;**. It arrives as
   `setu-ai-review-webserver-<commit>.zip`.
4. Identify the build:
   - The **seven-character code in the file name** is the start of the commit the package was
     built from.
   - `build-info.txt` inside the ZIP gives the full commit, branch, build time, a link to the
     workflow run and the Classic tool's commit.

Artifacts are kept for 90 days. Keep your own copy of any package you deploy (see Rollback).

## 2. Upload the website

1. Extract the ZIP. Its contents are the website itself, with no enclosing folder:

   ```
   index.html
   favicon.svg
   build-info.txt
   assets/          (the current tool's JavaScript and CSS)
   classic/
       index.html
       favicon.svg
       assets/
   ```

2. Transfer **everything inside the extracted folder** into the server directory that serves
   `https://ai.setu.ie/review/`.
   - `index.html` must sit **directly inside** that directory, not in a subfolder.
   - Keep the `classic/` directory as it is, beside `index.html`.
3. Do not rename or edit any file. The files are built for the `/review/` address. Placed under
   any other address, they will not load.

### What to confirm with SETU IT

These are server settings outside this repository. Standard web servers usually behave this way
already, but please confirm:

- `https://ai.setu.ie/review/` and `https://ai.setu.ie/review/classic/` serve the `index.html` in
  their directory (the normal "directory index" behaviour).
- `.js` files are served as JavaScript (`text/javascript`), `.css` as `text/css` and `.svg` as
  `image/svg+xml`.
- The site is served over HTTPS.
- `index.html` is not cached for long, ideally by a no-cache or short-cache rule, so that users
  get updates promptly. Files in `assets/` have unique names per build and can be cached for a
  long time.

No rewrite rules are needed: page addresses inside the tools use `#` (for example
`/review/#/help`), so the server only ever serves the two `index.html` files and their assets.

## 3. Update the website

1. Make and merge the code changes as usual, then download the package from the new `main` run
   (section 1).
2. Take a backup of the current deployed directory (see Rollback).
3. **Replace the whole contents** of the `/review/` directory with the new package's contents:
   delete the old files, then upload the new ones. Each build gives its JavaScript and CSS new
   file names, so copying over the top would leave old files behind.
4. Run the checks in section 5.

## 4. Roll back

- **Before every update**, keep a copy of what is deployed: either the ZIP you last uploaded, or
  a copy of the `/review/` directory taken from the server.
- To roll back, replace the whole `/review/` directory's contents with that earlier copy, in the
  same way as an update, then run the checks in section 5.
- Users' saved reviews are in their browsers, not on the server, so rolling back the files does
  not delete anyone's work. A review saved by a newer version may not open in an older one until
  the newer version is restored; it is not changed or deleted.

## 5. Checks after each upload

Open each address in a private window, or refresh with Ctrl/Cmd + Shift + R.

- [ ] `https://ai.setu.ie/review/` shows **SETU AI Integration Review**, and the browser tab has
      the same name.
- [ ] `https://ai.setu.ie/review/build-info.txt` shows the commit you meant to deploy.
- [ ] **Start Programme Review**, enter a title, move to the next section, refresh the page: the
      title is still there.
- [ ] **Start Module Review**, add an assessment, refresh: it is still there.
- [ ] **Help and guidance** opens.
- [ ] A review's **Export review** downloads a file, and **Import existing review** on the home
      page opens it.
- [ ] The programme's **Statement** page shows five sections, and **Print / save as PDF** opens
      the print preview.
- [ ] Opening `https://ai.setu.ie/review/classic/` shows the Classic tool.
- [ ] The Classic tool shows **AI Programme & Module Review Tool**, and its menu links work.

If a page is blank, check that `index.html` is directly in the `/review/` directory and that
`assets/` and `classic/` were uploaded beside it.

## 6. Moving users to the new address

Browsers keep saved reviews per website address, so reviews saved at
`kenmccarthy.github.io/setu-module-review/` do not appear at `ai.setu.ie/review/`
automatically. Ask users to move them themselves:

1. Open the existing site, https://kenmccarthy.github.io/setu-module-review/.
2. On the home page, choose **Export data**. This saves every review in that browser as one
   file. Users of the Classic tool can open
   https://kenmccarthy.github.io/setu-module-review/classic/ and use its **Export** button.
3. Open the new site, https://ai.setu.ie/review/.
4. On the home page, choose **Import existing review** and select the file. A file exported from
   the Classic tool can be imported here too; it is brought in as new programme and module
   reviews. It can also be imported into the Classic tool at `ai.setu.ie/review/classic/`.
5. Open **Saved reviews** and check that each review is listed and complete.

The GitHub Pages site stays available until you decide to retire it, so users can return to it
if needed.

## How the package is built

- The workflow `.github/workflows/webserver-package.yml` runs lint, type checking and the tests.
- It then builds the current tool with `VITE_BASE=/review/` and the Classic tool, from the fixed
  commit `CLASSIC_REF`, with `VITE_BASE=/review/classic/`.
- It writes `build-info.txt` and runs `scripts/verify-site.mjs`, which fails the run if:
  - either `index.html` is missing;
  - an asset path is wrong or points at a missing file;
  - development files have been included.
- Finally it uploads the site as the artifact.
- `CLASSIC_REF` must match the value in `deploy.yml`; `tests/workflows.test.ts` checks this.

To build the same package on your own computer:

```bash
npm ci
VITE_BASE=/review/ npm run build -- --outDir site --emptyOutDir
git worktree add classic-src 925fa573e104c7018bd5e8658d235e035933b935   # the CLASSIC_REF commit
(cd classic-src && npm ci && VITE_BASE=/review/classic/ npm run build)
cp -r classic-src/dist site/classic
node scripts/verify-site.mjs site /review/
```
