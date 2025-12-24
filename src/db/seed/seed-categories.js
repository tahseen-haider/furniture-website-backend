import { pool } from '#config';
import { categories } from '#constants';

const seed = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const c of categories) {
      const { rowCount } = await client.query(
        `
    INSERT INTO categories (title, slug, link, image)
    VALUES ($1,$2,$3,$4)
    ON CONFLICT (slug) DO NOTHING
    RETURNING id
    `,
        [c.title, c.slug, c.link, c.image]
      );

      if (rowCount === 0) {
        console.log(`Skipping existing category: ${c.title}`);
      } else {
        console.log(`Inserted category: ${c.title}`);
      }
    }

    await client.query('COMMIT');
    console.log('✅ Categories seeded successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
  } finally {
    client.release();
    process.exit();
  }
};

seed();
