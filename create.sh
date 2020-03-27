oc new-app nodejs~https://github.com/marrober/layers.git --name=$1 
oc set env dc/$1 THIS_LAYER_NAME=$1 
oc set env dc/$1 NEXT_LAYER_NAME=$2
oc label dc/$1 app.kubernetes.io/part-of=layers-app 
oc label dc/$1 app.openshift.io/runtime=nodejs
