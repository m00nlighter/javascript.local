<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "places".
 *
 * @property integer $id
 * @property string $title
 * @property string $description
 * @property string $lng
 * @property string $lat
 */
class Place extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'places';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['title', 'description', 'lng', 'lat'], 'required'],
            [['description'], 'string'],
            [['title'], 'string', 'max' => 50],
            [['lng', 'lat'], 'double'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'title' => 'Title',
            'description' => 'Description',
            'lng' => 'Lng',
            'lat' => 'Lat',
        ];
    }
}
