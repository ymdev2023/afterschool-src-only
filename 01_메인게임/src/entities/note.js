export function generateNoteComponents(k, pos, noteId) {
    return [
        k.sprite("assets", { anim: "note" }),
        k.area({ shape: new k.Rect(k.vec2(2, 2), 12, 12) }),
        k.body({ isStatic: true }),
        k.pos(pos),
        k.z(1), // 플레이어보다 아래, 배경보다 위에 배치
        { noteId },
        "note",
    ];
}
