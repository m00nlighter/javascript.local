<?php

use yii\db\Migration;

class m160902_113148_places extends Migration
{
   public function up()
    {
        $this->createTable('places', [
            'id' => $this->primaryKey(),
            'title' => $this->string()->notNull(),
            'description'=> $this->string()->notNull(),
            'lng'=> $this->string()->notNull(),
            'lat'=> $this->string()->notNull(),
                    ]);
    }

    /**
     * @inheritdoc
     */
    public function down()
    {
        $this->dropTable('places');
    }
}
