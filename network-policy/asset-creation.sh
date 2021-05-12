oc new-project left
oc label namespace left projectName=left

oc new-app nodejs~https://github.com/marrober/layers.git#cross-project --name=liam --env=NEXT_LAYER_NAME=mark --env=NEXT_LAYER_NAMESPACE=left --env=THIS_LAYER_NAME=liam --env=VERSION_ID=v1 --namespace=left

oc new-app nodejs~https://github.com/marrober/layers.git#cross-project --name=mark --env=NEXT_LAYER_NAME=richard --env=NEXT_LAYER_NAMESPACE=right --env=THIS_LAYER_NAME=mark --env=VERSION_ID=v1 --namespace=left

oc expose svc/liam --namespace left

oc new-project right
oc label namespace right projectName=right

oc new-app nodejs~https://github.com/marrober/layers.git#cross-project --name=richard --env=NEXT_LAYER_NAME=stuart --env=NEXT_LAYER_NAMESPACE=right --env=THIS_LAYER_NAME=richard --env=VERSION_ID=v1 --namespace=right

oc new-app nodejs~https://github.com/marrober/layers.git#cross-project --name=stuart --env=THIS_LAYER_NAME=stuart --env=VERSION_ID=v1 --namespace=right

oc new-project rogue
oc label namespace rogue projectName=rogue

oc new-app nodejs~https://github.com/marrober/layers.git#cross-project --name=rogue --env=NEXT_LAYER_NAME=richard --env=NEXT_LAYER_NAMESPACE=right --env=THIS_LAYER_NAME=rogue --env=VERSION_ID=v1 --namespace=rogue

oc expose svc/rogue --namespace rogue
