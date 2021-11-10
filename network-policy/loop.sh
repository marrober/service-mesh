for i in {1..100}; do curl $LEFTROUTE; echo ""; curl $ROGUEROUTE; echo ""; sleep .2;done
