function replace(field, old_chars, new_chars) {
    return `replace(
        ${field},
        ${old_chars},
        ${new_chars}
    )`;
}