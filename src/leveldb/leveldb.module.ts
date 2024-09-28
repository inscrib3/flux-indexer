import { Module, Global } from '@nestjs/common';
import { Level } from 'level';
import { LevelDBService } from './leveldb.service';

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: 'LEVELDB_CONNECTION',
      useFactory: async () => {
        const db = new Level('data', { valueEncoding: 'json' });
        console.log(db.location);
        await db.close();
        console.log('db close', db.location);
        await db.open();
        console.log('db open', db.location);
        if (!db.supports.permanence) {
          throw new Error('Persistent storage is required');
        }
        return db;
      },
    },
    LevelDBService,
  ],
  exports: ['LEVELDB_CONNECTION', LevelDBService],
})
export class LevelDBModule {}
