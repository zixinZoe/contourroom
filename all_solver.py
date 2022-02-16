#run 100 times with different Gaussian noise added to tdoas & return 100 tagLocs
import numpy as np
from tag_solver import tag_solver
import statistics

def calc_combo(locs,D_complete,estX,estY):           
    DDoA = D_complete
    estimation = [estX,estY]
    # estimation = [0,0]
    # estimation = [width//2,height//2]
    zero_coor = [-1,-1]
    print('estimation: ',estimation)
    tag_candidate  = tag_solver(estimation,[DDoA,locs,zero_coor])
    # print('tag_can2: ',tag_candidates)
    return tag_candidate

def NSDI_read_TDoA_new(line):
#“x0,y0;x1,y1;x2,y2;x4,y4@TDoA01,TDoA02,TDoA04@roomwidth*roomheight@seed_choice@dop” 
    parts = line.split("@")
    # print('parts0: ',parts[0])
    read_locs = parts[0].split(";")
    locs = np.zeros((len(read_locs),2))
    # width = 0
    # height = 0
    num = 0
    for read_loc in read_locs: 
        coors = read_loc.split(",")
        x = int(coors[0])
        y = int(coors[1])
        locs[num][0] = x
        locs[num][1] = y
        num = num+1

    init_coor = locs[0,:]
    resp_coor = locs[1:,:]
    read_tdoas = parts[1].split(";")

    room = parts[2].split("*")
    width = int(room[0])
    height = int(room[1])

    estX = 0
    estY = 0
    seed_choice = parts[3]
    if seed_choice == "rmctr":
        estX = width//2
        print('estX: ',estX)
        estY = height//2
        print('estY: ',estY)
    else:
        est_coors = seed_choice.split(",")
        estX = int(est_coors[0])
        estY = int(est_coors[1])

    tdoas = []
    mu = 0
    sigma = 50
    for read_tdoa in read_tdoas:
        noise_tdoa = []
        noise = np.random.normal(mu, sigma,100)
        for i in range(100):
            tdoa = int(float(read_tdoa))
            noise_tdoa.append(tdoa+noise[i])
        tdoas.append(noise_tdoa)
    tdoas = np.transpose(np.array(tdoas) )#100*respnum
    print('tdoas: ',tdoas)
    tag_candidates = []
    for row in tdoas:
        if all(tdoa<100000 and tdoa>-100000 for tdoa in row):
        #     try:
            D_complete = np.zeros((len(locs[:,0]),len(locs[:,0])))
            for resp_index in list(range(1,len(resp_coor[:,0])+1)): #resp_index with respect to input string of coors
                D_complete[0,resp_index] = row[resp_index-1]

            tag_candidate = np.transpose(calc_combo(locs,D_complete,estX,estY))[0]
            print("tag: ",tag_candidate)
        tag_candidates.append(tag_candidate)
    tag_candidates = np.array(tag_candidates)
    return tag_candidates
        #     except:
        #         return[]
        # else:
        #     print("tdoa too large")
        #     return []


# NSDI_read_TDoA_new("0,0;3600,0;3600,3100;0,3100@115;484;238")
# NSDI_read_TDoA_new("0,0;3600,0;3600,3100;0,3100;1500,1500;1000,1500@115;484;238;345;34")

