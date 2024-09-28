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
        try {
          const db = new Level('data', { valueEncoding: 'json' });
          if (!db.supports.permanence) {
            throw new Error('Persistent storage is required');
          }
          return db;
        } catch (e) {
          console.error(e);
          throw e;
        }
      },
    },
    LevelDBService,
  ],
  exports: ['LEVELDB_CONNECTION', LevelDBService],
})
export class LevelDBModule {}
