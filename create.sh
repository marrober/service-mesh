oc new-app nodejs~https://github.com/marrober/layers.git --name=$1 THIS_LAYER_NAME=$1 VERSION_ID=$2 NEXT_LAYER_NAME=$4
oc label dc/$1 app.kubernetes.io/part-of=$3
oc label dc/$1 app.openshift.io/runtime=nodejs
oc expose service $1
