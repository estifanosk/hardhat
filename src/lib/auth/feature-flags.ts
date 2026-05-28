export function isMagicLinkAuthEnabled() {
  const value = process.env.ENABLE_MAGIC_LINK_AUTH;

  if (value) {
    return value.toLowerCase() === 'true';
  }

  return process.env.NODE_ENV !== 'production';
}
