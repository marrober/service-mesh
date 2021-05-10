oc new-project layers-left
oc label namespace layers-left projectName=layers-left

oc new-app nodejs~https://github.com/marrober/layers.git#cross-project --name=left-01 --env=NEXT_LAYER_NAME=left-02 --env=NEXT_LAYER_NAMESPACE=layers-left --env=THIS_LAYER_NAME=left-01 --env=VERSION_ID=v1 --namespace=layers-left

oc new-app nodejs~https://github.com/marrober/layers.git#cross-project --name=left-02 --env=NEXT_LAYER_NAME=right-01 --env=NEXT_LAYER_NAMESPACE=layers-right --env=THIS_LAYER_NAME=left-02 --env=VERSION_ID=v1 --namespace=layers-left

oc expose svc/left-01 --namespace layers-left

oc new-project layers-right
oc label namespace layers-right projectName=layers-right

oc new-app nodejs~https://github.com/marrober/layers.git#cross-project --name=right-01 --env=NEXT_LAYER_NAME=right-02 --env=NEXT_LAYER_NAMESPACE=layers-right --env=THIS_LAYER_NAME=right-01 --env=VERSION_ID=v1 --namespace=layers-right

oc new-app nodejs~https://github.com/marrober/layers.git#cross-project --name=right-02 --env=THIS_LAYER_NAME=right-02 --env=VERSION_ID=v1 --namespace=layers-right

oc new-project layers-rogue

oc new-app nodejs~https://github.com/marrober/layers.git#cross-project --name=rogue --env=NEXT_LAYER_NAME=right-01 --env=NEXT_LAYER_NAMESPACE=layers-right --env=THIS_LAYER_NAME=rogue --env=VERSION_ID=v1 --namespace=layers-rogue

oc expose svc/rogue --namespace layers-rogue
