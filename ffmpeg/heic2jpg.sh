#for f in *.[hH][eE][iI][cC]; do 
#    heif-convert "$f" "${f%.*}.jpg"
#done

# 대소문자 구분 없이 *.HEIC, *.heic 모두 처리
for f in *.[hH][eE][iI][cC]; do
    convert "$f" -auto-orient "${f%.*}.jpg"
done
echo "회전 적용 및 JPG 변환 완료!"
