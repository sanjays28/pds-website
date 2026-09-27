/**
 * Footer — per content.md's "Footer" block + the primary tagline.
 *
 * FLAG (content gap): the coming-soon build's footer includes a row of
 * social icon links; content.md gives no social URLs (or a phone/email) to
 * link them to, so that row is omitted here rather than shipping dead `#`
 * links. Add it back once real handles/contact details exist.
 */
export function Footer({ description, tagline }: { description: string; tagline: string }) {
  return (
    <footer>
      <p className="footer-desc">{description}</p>
      <p className="f-tag">{tagline}</p>
      <p className="footer-copyright">
        © {new Date().getFullYear()} Proven Delivery Services. All rights reserved.
      </p>
    </footer>
  );
}
