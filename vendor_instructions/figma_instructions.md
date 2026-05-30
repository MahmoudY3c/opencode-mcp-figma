# https://mcp.figma.com/mcp - Available Tools

## get_screenshot

Generate a screenshot for a given node or the currently selected node in the Figma desktop app. Works on Figma design files (URL path `/design/`), FigJam boards (`/board/`), and Figma Slides (`/slides/`). The optional `maxDimension` parameter (positive integer, max 65536, default 1024) caps the longer edge of the rendered PNG in pixels — increase it when you need to inspect fine detail, decrease it for thumbnails or to save context. The JSON metadata entry in the response includes both `width`/`height` (the rendered PNG size) and `original_width`/`original_height` (the node's natural canvas size before any clamping), so callers can decide whether to re-request at a higher `maxDimension`. Use the nodeId parameter to specify a node id. nodeId parameter is REQUIRED. Use the fileKey parameter to specify the file key. fileKey parameter is REQUIRED. If a URL is provided, extract the file key and node id from the URL. For example, if given the URL https://figma.com/design/pqrs/ExampleFile?node-id=1-2 the extracted fileKey would be `pqrs` and the extracted nodeId would be `1:2`. If the URL does not include `node-id`, ask the user for a node-specific URL. Do not pass an empty or guessed nodeId. This tool is not supported for Figma Make Files (URLs containing `/make/`). By default this tool returns a short-lived URL to the screenshot plus curl instructions for downloading the PNG — the URL+curl path is strongly preferred because it uses far fewer tokens than embedding the image inline. The `enableBase64Response` parameter defaults to `false`. Only set `enableBase64Response: true` when the agent cannot fetch URLs (no shell access, no HTTP client, or a sandboxed environment that blocks outbound requests); when set, an inline base64 image entry is appended to the response in addition to the URL and curl instructions. If the URL is of the format https://figma.com/design/:fileKey/branch/:branchKey/:fileName then use the branchKey as the fileKey.

## get_design_context

Get design context for a Figma node — the primary tool for design-to-code workflows. Returns reference code, a screenshot, and contextual metadata that should be adapted to the target project. See the server instructions for how to interpret and adapt the response.

Use the nodeId parameter to specify a node id. Use the fileKey parameter to specify the file key. If a URL is provided, extract the node id and file key from the URL, for example, if given the URL https://figma.com/design/:fileKey/:fileName?node-id=1-2, the extracted nodeId would be `1:2` and the fileKey would be `:fileKey`. If the URL does not include `node-id`, ask the user for a node-specific URL. Do not pass an empty or guessed nodeId. If the URL is of the format https://figma.com/design/:fileKey/branch/:branchKey/:fileName then use the branchKey as the fileKey. If the URL is of the format https://figma.com/make/:makeFileKey/:makeFileName then use the makeFileKey to identify the Figma Make file. Only for Figma Make files (URLs containing `/make/`), and only when calling get_design_context, assume the nodeId is `0:1`. The response will contain a code string and a JSON of download URLs for the assets referenced in the code. It will also include a screenshot of the node for context by default.

## get_metadata

IMPORTANT: Always prefer to use get_design_context tool. Get metadata for a node or page in the Figma desktop app in XML format. Useful only for getting an overview of the structure, it only includes node IDs, layer types, names, positions and sizes. You can call get_design_context on the node IDs contained in this response. Use the nodeId parameter to specify a node id, it can also be the page id (e.g. 0:1). IMPORTANT: This tool only works for Figma design files (URL path `/design/`). It is NOT supported for FigJam (`/board/`) or Slides (`/slides/`) files. This tool is not supported for Figma Make Files (URLs containing `/make/`). The nodeId parameter is optional: when omitted, the tool returns a list of the top-level pages (guid + name) in the document instead of an XML dump — use this when you don't yet know which page or node to drill into. If the URL includes `node-id`, extract it and pass it as nodeId; for example, if given the URL https://figma.com/design/:fileKey/:fileName?node-id=1-2, the extracted nodeId would be `1:2`. If the URL does not include `node-id`, do not set nodeId; omit the field so the tool lists top-level pages. Do not pass an empty or guessed nodeId. If the URL is of the format https://figma.com/design/:fileKey/branch/:branchKey/:fileName then use the branchKey as the fileKey.

## get_variable_defs

Get variable definitions for a given node id. E.g. {'icon/default/secondary': #949494}Variables are reusable values that can be applied to all kinds of design properties, such as fonts, colors, sizes and spacings. Use the nodeId parameter to specify a node id. Extract the node id from the URL, for example, if given the URL https://figma.com/design/:fileKey/:fileName?node-id=1-2, the extracted nodeId would be `1:2`. If the URL does not include `node-id`, ask the user for a node-specific URL. Do not pass an empty or guessed nodeId. This remote tool requires a concrete node target. This tool is not supported for Figma Make Files (URLs containing `/make/`). If the URL is of the format https://figma.com/design/:fileKey/branch/:branchKey/:fileName then use the branchKey as the fileKey.

## get_figjam

Generate UI code for a given FigJam node in Figma. Use the nodeId parameter to specify a node id. If no node id is provided, use `0:1` which is the root node ID. Use the fileKey parameter to specify the file key. If a URL is provided, extract the node id from the URL, for example, if given the URL https://figma.com/board/:fileKey/:fileName?node-id=1-2, the extracted nodeId would be `1:2` and the fileKey would be `:fileKey`. IMPORTANT: This tool only works for FigJam files (URL path `/board/`), not other Figma files.

## generate_figma_design

Capture, import, or convert a web page (by URL) or HTML into a Figma design. Use this tool when the user wants to send, import, capture, screenshot, or push a webpage to Figma. Works with both local dev servers (localhost) and external websites. For LOCAL projects: explore the user's codebase to identify the page, dev server command, and URL before calling. For EXTERNAL URLs (not localhost): use Playwright MCP to capture — do NOT use 'open' with hash fragments on external sites. Call this tool without outputMode first to get detailed capture instructions and choose output mode. After capture, poll with captureId every 5 seconds (up to 10 times) until status is 'completed'. Each capture ID is single-use.

USING generate_figma_design WITH use_figma:

- For web apps, use BOTH tools in parallel: run this tool (generate_figma_design) to capture a pixel-perfect layout, and use use_figma with search_design_system to build the screen from design system components.
- Once both complete, refine the use_figma output to match the pixel-perfect layout from this tool's capture, then delete this tool's output (it was used as a layout reference only).
- For non-web apps (e.g. iOS), use use_figma only.
- For updating/syncing a page already in Figma, use use_figma only.

## generate_diagram

Create a flowchart, decision tree, gantt chart, sequence diagram, state diagram, or entity relationship diagram in FigJam, using Mermaid.js. Generated diagrams should be simple, unless a user asks for details. This tool also does not support generating Figma designs, class diagrams, timelines, venn diagrams, or other Mermaid.js diagram types. This tool also does not support font changes, or moving individual shapes around -- if a user asks for those changes to an existing diagram, encourage them to open the diagram in Figma. If the tool is unable to complete the user's task, reference the error that is passed back. Do not use the create_new_file tool prior to creating a diagram using this tool; generate_diagram creates its own files. IMPORTANT: After calling this tool, you MUST show the returned URL link to the user as a markdown link so they can view and edit the diagram.

## get_code_connect_map

Get a mapping of {[nodeId]: {codeConnectSrc: e.g. location of component in codebase, codeConnectName: e.g. name of component in codebase} E.g. {'1:2': { codeConnectSrc: 'https://github.com/foo/components/Button.tsx', codeConnectName: 'Button' } }. Use the nodeId parameter to specify a node id. Use the fileKey parameter to specify the file key. If a URL is provided, extract the node id and file key from the URL, for example, if given the URL https://figma.com/design/:fileKey/:fileName?node-id=1-2, the extracted nodeId would be `1:2` and the fileKey would be `:fileKey`. If the URL does not include `node-id`, ask the user for a node-specific URL. Do not pass an empty or guessed nodeId.

## whoami

Returns information about the authenticated user. If you are experiencing permission issues with other tools, you can use this tool to get information about who is authenticated and validate the right user is logged in.

## add_code_connect_map

Map a Figma node to a code component in your codebase using Code Connect. Use the nodeId parameter to specify a node id. Use the fileKey parameter to specify the file key. If a URL is provided, extract the node id and file key from the URL, for example, if given the URL https://figma.com/design/:fileKey/:fileName?node-id=1-2, the extracted nodeId would be `1:2` and the fileKey would be `:fileKey`. If the URL does not include `node-id`, ask the user for a node-specific URL. Do not pass an empty or guessed nodeId.

## get_code_connect_suggestions

Get AI-suggested strategy for linking a Figma node to code components via Code Connect. Workflow: call this tool → review suggestions with the user → call send_code_connect_mappings to save the approved mappings.

Use the nodeId parameter to specify a node id. Use the fileKey parameter to specify the file key. If a URL is provided, extract the node id and file key from the URL, for example, if given the URL https://figma.com/design/:fileKey/:fileName?node-id=1-2, the extracted nodeId would be `1:2` and the fileKey would be `:fileKey`. If the URL does not include `node-id`, ask the user for a node-specific URL. Do not pass an empty or guessed nodeId.

## send_code_connect_mappings

Save multiple Code Connect mappings in bulk. Use after get_code_connect_suggestions to confirm and save approved mappings.

Use the nodeId parameter to specify a node id. Use the fileKey parameter to specify the file key. If a URL is provided, extract the node id and file key from the URL, for example, if given the URL https://figma.com/design/:fileKey/:fileName?node-id=1-2, the extracted nodeId would be `1:2` and the fileKey would be `:fileKey`. If the URL does not include `node-id`, ask the user for a node-specific URL. Do not pass an empty or guessed nodeId.

## get_context_for_code_connect

Get structured component metadata including properties, variants, and descendant tree for a Figma component or component set. Returns property definitions with types and variant options, and a tree of descendant instances and text nodes with their property references. Designed for creating Code Connect template files. Use the nodeId parameter to specify a node id. Use the fileKey parameter to specify the file key. If a URL is provided, extract the node id and file key from the URL, for example, if given the URL https://figma.com/design/:fileKey/:fileName?node-id=1-2, the extracted nodeId would be `1:2` and the fileKey would be `:fileKey`. If the URL does not include `node-id`, ask the user for a node-specific URL. Do not pass an empty or guessed nodeId.

## use_figma

Create, edit, generate, or sync any design in Figma — UIs, screens, mockups, components, frames, variables, styles, text, images, layouts, and design systems. This is the general-purpose tool for writing to Figma; it works by running JavaScript via the Figma Plugin API. Works on Figma design files (URL path `/design/`), FigJam boards (`/board/`), and Figma Slides (`/slides/`).

IMPORTANT: If the /figma-use skill is available, load it before calling this tool.

Use this tool when the user wants to:

- Create or generate a design, screen, UI, or mockup in Figma — from scratch, from intent, or from code
- Update, edit, or sync an existing Figma design
- Generate or sync Figma designs from source code
- Set up or modify design tokens, variables, or styles
- Build or extend a design system or component/variant library
- Fix layout, spacing, auto-layout, or fill/hug issues
- Add component descriptions or Code Connect metadata to nodes
- Review or fix accessibility, contrast, typography, or visual polish
- Inspect or query node properties programmatically

CHOOSING BETWEEN use_figma AND generate_figma_design:

- Default to this tool (use_figma) for all Figma write operations.
- generate_figma_design is the exception: use it ONLY when capturing a web app page or view into Figma for the first time. For web apps, run both tools in parallel — generate_figma_design captures a pixel-perfect screenshot, use_figma builds the screen from imported design system components, then refine use_figma against the screenshot.
- For non-web targets (iOS, Android, generic UI) and from-scratch designs, use this tool only.
- For updating or syncing a Figma page already captured into Figma, use this tool — even if the source code has changed.

GOTCHAS:

- For the font "Inter", the style is "Semi Bold" (with a space), not "SemiBold". Same for "Extra Bold" not "ExtraBold".
- Setting figma.currentPage is not supported. Use `await figma.setCurrentPageAsync(page)` instead.
- getPluginData / setPluginData / getPluginDataKeys are NOT supported here (web-only, require a plugin manifest id). Use getSharedPluginData(namespace, key) / setSharedPluginData(...) / getSharedPluginDataKeys(namespace) instead. Pick a stable namespace (>=3 chars, alphanumeric/\_/.) unique to your integration.

REUSE THE DESIGN SYSTEM FIRST:
Before creating components, styles, or tokens from scratch, call search_design_system to find existing matches. Import component matches via importComponentByKeyAsync or importComponentSetByKeyAsync rather than recreating them. Reuse existing variables and styles rather than defining new ones.

## get_libraries

Get the design libraries associated with a Figma file. Returns two lists: (1) libraries currently added to the file (subscribed), and (2) libraries available to add (community UI kits and organization libraries). Each library includes its name, library key, description, and source type. The organization libraries portion of libraries_available_to_add is paginated — when the response includes a libraries_available_to_add_next_offset value, pass it back via the offset parameter to fetch the next page. Use the library keys from the response to scope searches with search_design_system by passing them as includeLibraryKeys.

## search_design_system

Search for design system assets (components, variables, and styles) based on a text query. Returns matching assets from all design libraries. Use this when you need to find specific components, variables (e.g. colors, spacing tokens), or styles from design libraries.

## create_new_file

Create a new blank Figma file. IMPORTANT: You MUST load the /figma-create-new-file skill BEFORE every call to this tool, if it exists. NEVER call this tool without loading that skill first if it exists. By default the file is placed in the authenticated user's drafts folder; If specified it can be placed inside a project. Use this tool when you need a new file to work with before calling use_figma. Returns the new file key and URL. Requires a planKey. If the user already provided a planKey, use it directly. Otherwise, call the whoami tool first to get the list of plans. If the user has one plan, use its "key" field. If multiple, ask the user which team or organization to use. Optionally accepts a projectId. If the URL is of the format https://figma.com/files/project/:projectId, https://figma.com/files/:orgId/project/:projectId, or https://figma.com/files/team/:teamId/project/:projectId then use the :projectId as the projectId.

## upload_assets

Upload assets (images, etc.) into a Figma file. Call with a "count" to get that many single-use upload URLs. POST raw asset bytes to each URL with the correct Content-Type header (e.g. image/png, image/jpeg). Set batchCommit to true so all assets can commit and place in one file operation. If a commitUrl is returned, after all uploads succeed, call it exactly once to commit and place all assets. If no commitUrl is returned, each upload URL commits and places automatically. For a single image with nodeId, sets it as a fill on that existing node. Without nodeId, creates new frames with image fills on the current page. Supports PNG, JPG, GIF, and WebP formats. Max 10MB per asset. Works on Figma design files (URL path `/design/`), FigJam boards (`/board/`), and Figma Slides (`/slides/`).
