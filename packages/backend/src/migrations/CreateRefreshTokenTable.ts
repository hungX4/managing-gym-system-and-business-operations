// packages/backend/src/migrations/[timestamp]-CreateRefreshTokenTable.ts

import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm'

export class CreateRefreshTokenTable1714000000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'refresh_tokens',
            columns: [
                { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
                { name: 'token', type: 'varchar', length: '512', isUnique: true },
                { name: 'user_id', type: 'uuid' },
                { name: 'device_id', type: 'varchar', length: '128', default: "'default'" },
                { name: 'expires_at', type: 'timestamptz' },
                { name: 'is_revoked', type: 'boolean', default: false },
                { name: 'replaced_by', type: 'varchar', isNullable: true },
                { name: 'created_at', type: 'timestamptz', default: 'now()' },
            ],
        }), true)

        await queryRunner.createIndex('refresh_tokens', new TableIndex({
            name: 'IDX_refresh_tokens_token',
            columnNames: ['token'],
        }))

        await queryRunner.createForeignKey('refresh_tokens', new TableForeignKey({
            columnNames: ['user_id'],
            referencedTableName: 'user',
            referencedColumnNames: ['user_id'],
            onDelete: 'CASCADE',
        }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('refresh_tokens')
    }
}