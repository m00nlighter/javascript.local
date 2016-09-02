<?

namespace app\controllers;

use yii\rest\ActiveController;

class PlaceController extends ActiveController
{
    public $modelClass = 'app\models\Place';
    public function behaviors()
    {
        return \yii\helpers\ArrayHelper::merge([
            'cors' => [
                'class' => \yii\filters\Cors::className(),
            ],
        ], parent::behaviors());
     }

}
