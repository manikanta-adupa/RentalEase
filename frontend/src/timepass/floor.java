package timepass;

public class floor {
    public static void main(String[] args) {
        int[] arr={1, 2, 8, 10, 10, 12, 19};
        int x=5;
        int ans=findFloor(arr,x);
        System.out.println(ans);
    }
    static int findFloor(int[] arr, int x) {
        // code here
        int st=0, end=arr.length-1, md=0;
        while(st<=end){
            md=st+(end-st)/2;
            if(arr[md]<=x){
                st=md+1;
            }else{
                end=md-1;
            }
        }
        if(end>=0){
            return end;
        }
        return -1;
    }
}
