oc new-app nodejs~https://github.com/marrober/layers.git#route --name=$1 
oc set env dc/$1 THIS_LAYER_NAME=$1 
oc set env dc/$1 NEXT_ROUTES=$4
oc set env dc/$1 VERSION_ID=$2
oc label dc/$1 app.kubernetes.io/part-of=$3 
oc label dc/$1 app.openshift.io/runtime=nodejs
oc expose service $1
