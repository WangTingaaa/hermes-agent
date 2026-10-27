# Mira cursor theme

Mira teal (`#10b5c8`), derived from Cua Default 2.0.0 (MIT):
https://github.com/trycua/cua/blob/cua-driver-rs-v0.21.0/libs/cua-driver/rust/crates/cursor-overlay/assets/cua.default.lottie

The source keeps the original animations and recolors their primary fill and stroke.
`mira.cua-theme` is the portable runtime data; no download is needed on the user's machine.
The original license is in `LICENSE.cua.txt`.

Rebuild with the PM-installed driver:

```sh
cua-driver cursor-theme build mira.lottie --output mira.cua-theme
```

Select it with `computer_use.cursor_theme: mira.default`. Browser feedback uses
`browser.cursor_color: '#10b5c8'` and Mira action labels.
